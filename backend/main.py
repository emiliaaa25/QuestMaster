from datetime import datetime
from typing import List

from fastapi import Depends, FastAPI, HTTPException, status
from sqlmodel import Session, select

from database import create_db_and_tables, get_session
from models import (
    GlobalStats,
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
)
from preset_hobbies import PRESET_HOBBIES, get_preset_hobby

app = FastAPI(title="Hobby Catalyst API", version="2.0.0")


@app.on_event("startup")
def on_startup():
    """Initialize DB schema and migrations when the API boots."""
    create_db_and_tables()


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
def read_hobbies(session: Session = Depends(get_session)):
    """Return all hobbies."""
    return session.exec(select(Hobby)).all()


@app.get("/hobbies/{hobby_id}", response_model=HobbyReadWithQuests)
def read_hobby(hobby_id: int, session: Session = Depends(get_session)):
    """Return one hobby with its related quests."""
    hobby = session.get(Hobby, hobby_id)
    if not hobby:
        raise HTTPException(status_code=404, detail="Hobby not found")
    return hobby


@app.post("/hobbies", response_model=HobbyRead, status_code=status.HTTP_201_CREATED)
def create_hobby(payload: HobbyCreate, session: Session = Depends(get_session)):
    """Create a new hobby from request payload."""
    if payload.preset_slug:
        existing_preset_hobby = session.exec(
            select(Hobby).where(Hobby.preset_slug == payload.preset_slug)
        ).first()
        if existing_preset_hobby:
            raise HTTPException(status_code=409, detail="Preset hobby already joined")

    hobby = Hobby(**payload.dict())
    session.add(hobby)
    session.commit()
    session.refresh(hobby)
    return hobby


@app.get("/preset-hobbies", response_model=List[PresetHobbyRead])
def read_preset_hobbies(session: Session = Depends(get_session)):
    """Return the preset hobby catalog with per-user joined state."""
    joined_hobbies = session.exec(
        select(Hobby).where(Hobby.preset_slug.is_not(None))
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
def join_preset_hobby(preset_slug: str, session: Session = Depends(get_session)):
    """Join a preset hobby once and create all of its quest templates as user quests."""
    preset = get_preset_hobby(preset_slug)
    if not preset:
        raise HTTPException(status_code=404, detail="Preset hobby not found")

    existing_hobby = session.exec(
        select(Hobby).where(Hobby.preset_slug == preset_slug)
    ).first()
    if existing_hobby:
        return PresetHobbyJoinResponse(already_joined=True, hobby=existing_hobby)

    now = datetime.utcnow()
    hobby = Hobby(
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
def update_hobby(hobby_id: int, payload: HobbyUpdate, session: Session = Depends(get_session)):
    """Partially update hobby fields and refresh its update timestamp."""
    hobby = session.get(Hobby, hobby_id)
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
def delete_hobby(hobby_id: int, session: Session = Depends(get_session)):
    """Delete a hobby (its quests are removed via relationship cascade)."""
    hobby = session.get(Hobby, hobby_id)
    if not hobby:
        raise HTTPException(status_code=404, detail="Hobby not found")

    session.delete(hobby)
    session.commit()
    return {"message": "Hobby deleted successfully"}


@app.get("/hobbies/{hobby_id}/stats", response_model=HobbyStats)
def get_hobby_stats(hobby_id: int, session: Session = Depends(get_session)):
    """Return computed stats for a specific hobby."""
    hobby = session.get(Hobby, hobby_id)
    if not hobby:
        raise HTTPException(status_code=404, detail="Hobby not found")
    return build_hobby_stats(hobby)


@app.get("/stats/global", response_model=GlobalStats)
def get_global_stats(session: Session = Depends(get_session)):
    """Return cross-hobby aggregate statistics for dashboard usage."""
    hobbies = session.exec(select(Hobby)).all()
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
def read_quests(session: Session = Depends(get_session)):
    """Return all quests from all hobbies."""
    return session.exec(select(Quest)).all()


@app.post("/quests", response_model=QuestRead, status_code=status.HTTP_201_CREATED)
def add_quest(payload: QuestCreate, session: Session = Depends(get_session)):
    """Create a quest and update hobby activity metadata."""
    hobby = session.get(Hobby, payload.hobby_id)
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
def update_quest(quest_id: int, payload: QuestUpdate, session: Session = Depends(get_session)):
    """Partially update a quest and propagate relevant hobby metadata changes."""
    quest = session.get(Quest, quest_id)
    if not quest:
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

    hobby = session.get(Hobby, quest.hobby_id)
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
def delete_quest(quest_id: int, session: Session = Depends(get_session)):
    """Delete a quest and refresh activity/mastery on its parent hobby."""
    quest = session.get(Quest, quest_id)
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")

    hobby = session.get(Hobby, quest.hobby_id)
    session.delete(quest)
    session.commit()

    if hobby:
        hobby.last_activity_at = datetime.utcnow()
        hobby.updated_at = datetime.utcnow()
        hobby.is_mastered = calculate_hobby_mastered(hobby)
        session.add(hobby)
        session.commit()

    return {"message": "Quest deleted successfully"}