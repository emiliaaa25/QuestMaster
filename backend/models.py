from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import validator
from sqlalchemy import Column, Enum as SAEnum
from sqlmodel import Field, Relationship, SQLModel


class HobbyCategory(str, Enum):
    """Allowed hobby categories exposed by the API."""
    CREATIVE = "Creative"
    PHYSICAL = "Physical"
    INTELLECTUAL = "Intellectual"


class QuestDifficulty(str, Enum):
    """Difficulty values used for quest effort/reward logic."""
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"


class QuestStatus(str, Enum):
    """Workflow stages for quest progress."""
    TODO = "To Do"
    DOING = "Doing"
    DONE = "Done"


class UserBase(SQLModel):
    """Shared user fields used by auth schemas and DB model."""
    username: str = Field(index=True, unique=True)
    email: str = Field(index=True, unique=True)


class User(UserBase, table=True):
    """Database table for authenticated users."""
    id: Optional[int] = Field(default=None, primary_key=True)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    hobbies: List["Hobby"] = Relationship(back_populates="user", cascade_delete=True)


class HobbyBase(SQLModel):
    """Shared hobby fields used by create/read DB and API schemas."""
    name: str = Field(index=True)
    category: HobbyCategory = Field(
        sa_column=Column(
            SAEnum(
                HobbyCategory,
                values_callable=lambda enum_class: [member.value for member in enum_class],
                native_enum=False,
            ),
            nullable=False,
        )
    )
    description: Optional[str] = None
    icon: str = Field(default="🎯")
    image_url: Optional[str] = None
    preset_slug: Optional[str] = Field(default=None, index=True)


class Hobby(HobbyBase, table=True):
    """Database table for hobbies."""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id", index=True)
    is_mastered: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_activity_at: Optional[datetime] = None

    user: Optional[User] = Relationship(back_populates="hobbies")
    quests: List["Quest"] = Relationship(back_populates="hobby", cascade_delete=True)


class QuestBase(SQLModel):
    """Shared quest fields used by DB and API schemas."""
    title: str
    description: Optional[str] = None
    difficulty: QuestDifficulty = Field(
        default=QuestDifficulty.MEDIUM,
        sa_column=Column(
            SAEnum(
                QuestDifficulty,
                values_callable=lambda enum_class: [member.value for member in enum_class],
                native_enum=False,
            ),
            nullable=False,
        ),
    )
    status: QuestStatus = Field(
        default=QuestStatus.TODO,
        sa_column=Column(
            SAEnum(
                QuestStatus,
                values_callable=lambda enum_class: [member.value for member in enum_class],
                native_enum=False,
            ),
            nullable=False,
        ),
    )
    xp_value: int = Field(default=0, ge=0)
    hours_spent: float = Field(default=0, ge=0)


class Quest(QuestBase, table=True):
    """Database table for quests linked to a hobby."""
    id: Optional[int] = Field(default=None, primary_key=True)
    # Legacy compatibility: some existing databases still require this column.
    is_completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

    hobby_id: int = Field(foreign_key="hobby.id")
    hobby: Optional[Hobby] = Relationship(back_populates="quests")

    @validator("xp_value", pre=True, always=True)
    def set_default_xp(cls, value, values):
        """Auto-fill XP from difficulty when xp_value is missing or invalid."""
        if isinstance(value, int) and value > 0:
            return value

        difficulty = values.get("difficulty", QuestDifficulty.MEDIUM)
        mapping = {
            QuestDifficulty.EASY: 10,
            QuestDifficulty.MEDIUM: 25,
            QuestDifficulty.HARD: 50,
        }
        return mapping.get(difficulty, 25)


class HobbyCreate(HobbyBase):
    pass


class HobbyUpdate(SQLModel):
    name: Optional[str] = None
    category: Optional[HobbyCategory] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    image_url: Optional[str] = None
    preset_slug: Optional[str] = None
    is_mastered: Optional[bool] = None


class HobbyRead(HobbyBase):
    id: int
    is_mastered: bool
    created_at: datetime
    updated_at: datetime
    last_activity_at: Optional[datetime] = None


class QuestCreate(QuestBase):
    hobby_id: int


class QuestUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[QuestDifficulty] = None
    status: Optional[QuestStatus] = None
    xp_value: Optional[int] = Field(default=None, ge=0)
    hours_spent: Optional[float] = Field(default=None, ge=0)


class QuestRead(QuestBase):
    id: int
    hobby_id: int
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None


class HobbyReadWithQuests(HobbyRead):
    quests: List[QuestRead] = Field(default_factory=list)


class HobbyStats(SQLModel):
    total_quests: int
    completed_quests: int
    doing_quests: int
    todo_quests: int
    progress_percentage: float
    total_hours_invested: float
    last_activity_at: Optional[datetime] = None
    total_xp_earned: int


class GlobalStats(SQLModel):
    total_hobbies: int
    total_quests: int
    completed_quests: int
    global_progress_percentage: float
    total_hours_invested: float
    total_xp_earned: int


class PresetQuestRead(SQLModel):
    title: str
    description: Optional[str] = None
    difficulty: QuestDifficulty
    xp_value: int
    estimated_hours: float


class PresetHobbyRead(SQLModel):
    slug: str
    name: str
    category: HobbyCategory
    description: str
    icon: str
    image_url: Optional[str] = None
    total_quests: int
    total_xp: int
    estimated_hours: float
    joined: bool = False
    joined_hobby_id: Optional[int] = None
    quests: List[PresetQuestRead] = Field(default_factory=list)


class PresetHobbyJoinResponse(SQLModel):
    already_joined: bool
    hobby: HobbyReadWithQuests


class UserRegister(SQLModel):
    username: str
    email: str
    password: str


class UserLogin(SQLModel):
    username: str
    password: str


class UserRead(UserBase):
    id: int
    created_at: datetime


class AuthToken(SQLModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead