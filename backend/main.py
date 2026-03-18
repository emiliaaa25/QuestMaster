from datetime import datetime, timedelta
import os
from typing import List

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlmodel import Session, select

from database import create_db_and_tables, get_session
from models import (
    GlobalStats,
    AuthToken,
    Hobby,
    HobbyCreate,
    HobbyRead,
    HobbyReadWithQuests,
    PresetHobbyJoinResponse,
    PresetHobbyRead,
    PresetQuestRead,
    HobbyStats,
    HobbyUpdate,
    Quest,
    QuestCreate,
    QuestRead,
    QuestStatus,
    QuestUpdate,
    User,
    UserLogin,
    UserRead,
    UserRegister,
)
from preset_hobbies import PRESET_HOBBIES, get_preset_hobby

app = FastAPI(title="Hobby Catalyst API", version="2.0.0")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-me-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24


@app.on_event("startup")
def on_startup():
    """Initialize DB schema and migrations when the API boots."""
    create_db_and_tables()


def verify_password(plain_password: str, password_hash: str) -> bool:
    return pwd_context.verify(plain_password, password_hash)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_user_by_username(session: Session, username: str) -> User | None:
    return session.exec(select(User).where(User.username == username)).first()


def get_user_by_email(session: Session, email: str) -> User | None:
    return session.exec(select(User).where(User.email == email)).first()


def normalize_email(email: str) -> str:
    return email.strip().lower()


def authenticate_user(session: Session, identifier: str, password: str) -> User | None:
    if "@" in identifier:
        user = get_user_by_email(session, normalize_email(identifier))
    else:
        user = get_user_by_username(session, identifier)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def build_auth_response(user: User) -> AuthToken:
    token = create_access_token(user.id)
    return AuthToken(
        access_token=token,
        user=UserRead(id=user.id, username=user.username, email=user.email, created_at=user.created_at),
    )


def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        parsed_user_id = int(user_id)
    except (JWTError, ValueError):
        raise credentials_exception

    user = session.get(User, parsed_user_id)
    if user is None:
        raise credentials_exception
    return user


@app.post("/auth/register", response_model=AuthToken, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserRegister, session: Session = Depends(get_session)):
    """Register a new user account and return a bearer token."""
    normalized_username = payload.username.strip().lower()
    normalized_email = normalize_email(payload.email)
    if len(normalized_username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters")
    if "@" not in normalized_email:
        raise HTTPException(status_code=400, detail="Email is invalid")
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    existing = get_user_by_username(session, normalized_username)
    if existing:
        raise HTTPException(status_code=409, detail="Username already exists")

    existing_email = get_user_by_email(session, normalized_email)
    if existing_email:
        raise HTTPException(status_code=409, detail="Email already exists")

    user = User(
        username=normalized_username,
        email=normalized_email,
        password_hash=hash_password(payload.password),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return build_auth_response(user)


@app.post("/auth/login", response_model=AuthToken)
def login_user(payload: UserLogin, session: Session = Depends(get_session)):
    """Authenticate a user and return a bearer token."""
    user = authenticate_user(session, payload.username.strip().lower(), payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username/email or password")
    return build_auth_response(user)


@app.get("/auth/me", response_model=UserRead)
def read_current_user(current_user: User = Depends(get_current_user)):
    return UserRead(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        created_at=current_user.created_at,
    )


def calculate_hobby_mastered(hobby: Hobby) -> bool:
    """A hobby is mastered only when all its quests are marked as done."""
    if not hobby.quests:
        return False
    return all(quest.status == QuestStatus.DONE for quest in hobby.quests)


def build_hobby_stats(hobby: Hobby) -> HobbyStats:
    """Build aggregated statistics for one hobby and its quests."""
    total = len(hobby.quests)
    completed = sum(1 for q in hobby.quests if q.status == QuestStatus.DONE)
    doing = sum(1 for q in hobby.quests if q.status == QuestStatus.DOING)
    todo = sum(1 for q in hobby.quests if q.status == QuestStatus.TODO)
    progress = (completed / total * 100) if total > 0 else 0
    total_hours = sum(q.hours_spent for q in hobby.quests)
    total_xp = sum(q.xp_value for q in hobby.quests if q.status == QuestStatus.DONE)

    return HobbyStats(
        total_quests=total,
        completed_quests=completed,
        doing_quests=doing,
        todo_quests=todo,
        progress_percentage=round(progress, 2),
        total_hours_invested=round(total_hours, 2),
        last_activity_at=hobby.last_activity_at,
        total_xp_earned=total_xp,
    )


def build_preset_hobby_response(preset, joined_hobby: Hobby | None = None) -> PresetHobbyRead:
    """Map a preset catalog definition to the API response shape."""
    return PresetHobbyRead(
        slug=preset.slug,
        name=preset.name,
        category=preset.category,
        description=preset.description,
        icon=preset.icon,
        image_url=preset.image_url,
        total_quests=len(preset.quests),
        total_xp=preset.total_xp,
        estimated_hours=preset.estimated_hours,
        joined=joined_hobby is not None,
        joined_hobby_id=joined_hobby.id if joined_hobby else None,
        quests=[
            PresetQuestRead(
                title=quest.title,
                description=quest.description,
                difficulty=quest.difficulty,
                xp_value=quest.xp_value,
                estimated_hours=quest.estimated_hours,
            )
            for quest in preset.quests
        ],
    )


@app.get("/hobbies", response_model=List[HobbyRead])
def read_hobbies(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Return all hobbies."""
    return session.exec(select(Hobby).where(Hobby.user_id == current_user.id)).all()


@app.get("/hobbies/{hobby_id}", response_model=HobbyReadWithQuests)
def read_hobby(
    hobby_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Return one hobby with its related quests."""
    hobby = session.exec(
        select(Hobby).where(Hobby.id == hobby_id, Hobby.user_id == current_user.id)
    ).first()
    if not hobby:
        raise HTTPException(status_code=404, detail="Hobby not found")
    return hobby


@app.post("/hobbies", response_model=HobbyRead, status_code=status.HTTP_201_CREATED)
def create_hobby(
    payload: HobbyCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Create a new hobby from request payload."""
    if payload.preset_slug:
        existing_preset_hobby = session.exec(
            select(Hobby).where(
                Hobby.preset_slug == payload.preset_slug,
                Hobby.user_id == current_user.id,
            )
        ).first()
        if existing_preset_hobby:
            raise HTTPException(status_code=409, detail="Preset hobby already joined")

    hobby = Hobby(**payload.dict(), user_id=current_user.id)
    session.add(hobby)
    session.commit()
    session.refresh(hobby)
    return hobby


@app.get("/preset-hobbies", response_model=List[PresetHobbyRead])
def read_preset_hobbies(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Return the preset hobby catalog with per-user joined state."""
    joined_hobbies = session.exec(
        select(Hobby).where(Hobby.preset_slug.is_not(None), Hobby.user_id == current_user.id)
    ).all()
    joined_by_slug = {
        hobby.preset_slug: hobby for hobby in joined_hobbies if hobby.preset_slug is not None
    }
    return [
        build_preset_hobby_response(preset, joined_by_slug.get(preset.slug))
        for preset in PRESET_HOBBIES
    ]


@app.post(
    "/preset-hobbies/{preset_slug}/join",
    response_model=PresetHobbyJoinResponse,
    status_code=status.HTTP_201_CREATED,
)
def join_preset_hobby(
    preset_slug: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Join a preset hobby once and create all of its quest templates as user quests."""
    preset = get_preset_hobby(preset_slug)
    if not preset:
        raise HTTPException(status_code=404, detail="Preset hobby not found")

    existing_hobby = session.exec(
        select(Hobby).where(Hobby.preset_slug == preset_slug, Hobby.user_id == current_user.id)
    ).first()
    if existing_hobby:
        return PresetHobbyJoinResponse(already_joined=True, hobby=existing_hobby)

    now = datetime.utcnow()
    hobby = Hobby(
        user_id=current_user.id,
        name=preset.name,
        category=preset.category,
        description=preset.description,
        icon=preset.icon,
        image_url=preset.image_url,
        preset_slug=preset.slug,
        created_at=now,
        updated_at=now,
        last_activity_at=now,
        is_mastered=False,
    )
    session.add(hobby)
    session.commit()
    session.refresh(hobby)

    for quest_template in preset.quests:
        session.add(
            Quest(
                hobby_id=hobby.id,
                title=quest_template.title,
                description=quest_template.description,
                difficulty=quest_template.difficulty,
                status=QuestStatus.TODO,
                xp_value=quest_template.xp_value,
                hours_spent=0,
                is_completed=False,
            )
        )

    session.commit()
    session.refresh(hobby)
    return PresetHobbyJoinResponse(already_joined=False, hobby=hobby)


@app.patch("/hobbies/{hobby_id}", response_model=HobbyRead)
def update_hobby(
    hobby_id: int,
    payload: HobbyUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Partially update hobby fields and refresh its update timestamp."""
    hobby = session.exec(
        select(Hobby).where(Hobby.id == hobby_id, Hobby.user_id == current_user.id)
    ).first()
    if not hobby:
        raise HTTPException(status_code=404, detail="Hobby not found")

    updates = payload.dict(exclude_unset=True)
    for key, value in updates.items():
        setattr(hobby, key, value)

    hobby.updated_at = datetime.utcnow()
    session.add(hobby)
    session.commit()
    session.refresh(hobby)
    return hobby


@app.delete("/hobbies/{hobby_id}")
def delete_hobby(
    hobby_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Delete a hobby (its quests are removed via relationship cascade)."""
    hobby = session.exec(
        select(Hobby).where(Hobby.id == hobby_id, Hobby.user_id == current_user.id)
    ).first()
    if not hobby:
        raise HTTPException(status_code=404, detail="Hobby not found")

    session.delete(hobby)
    session.commit()
    return {"message": "Hobby deleted successfully"}


@app.get("/hobbies/{hobby_id}/stats", response_model=HobbyStats)
def get_hobby_stats(
    hobby_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Return computed stats for a specific hobby."""
    hobby = session.exec(
        select(Hobby).where(Hobby.id == hobby_id, Hobby.user_id == current_user.id)
    ).first()
    if not hobby:
        raise HTTPException(status_code=404, detail="Hobby not found")
    return build_hobby_stats(hobby)


@app.get("/stats/global", response_model=GlobalStats)
def get_global_stats(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Return cross-hobby aggregate statistics for dashboard usage."""
    hobbies = session.exec(select(Hobby).where(Hobby.user_id == current_user.id)).all()
    total_hobbies = len(hobbies)
    all_quests = [quest for hobby in hobbies for quest in hobby.quests]
    total_quests = len(all_quests)
    completed = sum(1 for q in all_quests if q.status == QuestStatus.DONE)
    progress = (completed / total_quests * 100) if total_quests else 0
    total_hours = sum(q.hours_spent for q in all_quests)
    total_xp = sum(q.xp_value for q in all_quests if q.status == QuestStatus.DONE)

    return GlobalStats(
        total_hobbies=total_hobbies,
        total_quests=total_quests,
        completed_quests=completed,
        global_progress_percentage=round(progress, 2),
        total_hours_invested=round(total_hours, 2),
        total_xp_earned=total_xp,
    )


@app.get("/quests", response_model=List[QuestRead])
def read_quests(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Return all quests from all hobbies."""
    hobby_ids = session.exec(select(Hobby.id).where(Hobby.user_id == current_user.id)).all()
    if not hobby_ids:
        return []
    return session.exec(select(Quest).where(Quest.hobby_id.in_(hobby_ids))).all()


@app.post("/quests", response_model=QuestRead, status_code=status.HTTP_201_CREATED)
def add_quest(
    payload: QuestCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Create a quest and update hobby activity metadata."""
    hobby = session.exec(
        select(Hobby).where(Hobby.id == payload.hobby_id, Hobby.user_id == current_user.id)
    ).first()
    if not hobby:
        raise HTTPException(status_code=404, detail="Hobby not found")

    quest = Quest(**payload.dict())
    quest.is_completed = quest.status == QuestStatus.DONE
    session.add(quest)

    hobby.last_activity_at = datetime.utcnow()
    hobby.updated_at = datetime.utcnow()
    hobby.is_mastered = calculate_hobby_mastered(hobby)
    session.add(hobby)

    session.commit()
    session.refresh(quest)
    return quest


@app.patch("/quests/{quest_id}", response_model=QuestRead)
def update_quest(
    quest_id: int,
    payload: QuestUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Partially update a quest and propagate relevant hobby metadata changes."""
    quest = session.get(Quest, quest_id)
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")

    hobby = session.exec(
        select(Hobby).where(Hobby.id == quest.hobby_id, Hobby.user_id == current_user.id)
    ).first()
    if not hobby:
        raise HTTPException(status_code=404, detail="Quest not found")

    updates = payload.dict(exclude_unset=True)
    for key, value in updates.items():
        setattr(quest, key, value)

    now = datetime.utcnow()
    quest.updated_at = now
    if quest.status == QuestStatus.DONE:
        quest.completed_at = now
    elif "status" in updates:
        quest.completed_at = None

    quest.is_completed = quest.status == QuestStatus.DONE

    if hobby:
        hobby.last_activity_at = now
        hobby.updated_at = now
        session.add(hobby)

    session.add(quest)
    session.commit()

    if hobby:
        session.refresh(hobby)
        hobby.is_mastered = calculate_hobby_mastered(hobby)
        session.add(hobby)
        session.commit()

    session.refresh(quest)
    return quest


@app.delete("/quests/{quest_id}")
def delete_quest(
    quest_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Delete a quest and refresh activity/mastery on its parent hobby."""
    quest = session.get(Quest, quest_id)
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")

    hobby = session.exec(
        select(Hobby).where(Hobby.id == quest.hobby_id, Hobby.user_id == current_user.id)
    ).first()
    if not hobby:
        raise HTTPException(status_code=404, detail="Quest not found")

    session.delete(quest)
    session.commit()

    if hobby:
        hobby.last_activity_at = datetime.utcnow()
        hobby.updated_at = datetime.utcnow()
        hobby.is_mastered = calculate_hobby_mastered(hobby)
        session.add(hobby)
        session.commit()

    return {"message": "Quest deleted successfully"}