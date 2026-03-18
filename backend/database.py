from sqlmodel import Session, SQLModel, create_engine
import os
import sqlite3
from typing import Set


sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
db_file_path = os.path.join(os.path.dirname(__file__), sqlite_file_name)

engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})


def _table_exists(connection: sqlite3.Connection, table_name: str) -> bool:
    result = connection.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        (table_name,),
    ).fetchone()
    return result is not None


def _table_columns(connection: sqlite3.Connection, table_name: str) -> Set[str]:
    rows = connection.execute(f"PRAGMA table_info({table_name})").fetchall()
    return {row[1] for row in rows}


def _add_column_if_missing(
    connection: sqlite3.Connection,
    table_name: str,
    column_name: str,
    definition: str,
):
    """Add a column only when it does not already exist."""
    if column_name not in _table_columns(connection, table_name):
        connection.execute(f"ALTER TABLE {table_name} ADD COLUMN {definition}")


def migrate_legacy_schema():
    """Migrate old SQLite schemas and normalize legacy data values."""
    if not os.path.exists(db_file_path):
        return

    with sqlite3.connect(db_file_path) as connection:
        if _table_exists(connection, "hobby"):
            _add_column_if_missing(connection, "hobby", "created_at", "created_at TEXT")
            _add_column_if_missing(connection, "hobby", "description", "description TEXT")
            _add_column_if_missing(connection, "hobby", "icon", "icon TEXT DEFAULT '🎯'")
            _add_column_if_missing(connection, "hobby", "image_url", "image_url TEXT")
            _add_column_if_missing(connection, "hobby", "preset_slug", "preset_slug TEXT")
            _add_column_if_missing(connection, "hobby", "is_mastered", "is_mastered INTEGER DEFAULT 0")
            _add_column_if_missing(connection, "hobby", "updated_at", "updated_at TEXT")
            _add_column_if_missing(connection, "hobby", "last_activity_at", "last_activity_at TEXT")

            connection.execute("UPDATE hobby SET category='Physical' WHERE category='Sport'")
            connection.execute("UPDATE hobby SET category='Intellectual' WHERE category='Tech'")

            connection.execute(
                "UPDATE hobby SET name='Untitled Hobby' WHERE name IS NULL OR TRIM(name)=''"
            )
            connection.execute(
                "UPDATE hobby SET category='Creative' WHERE category IS NULL OR TRIM(category)=''"
            )
            connection.execute(
                "UPDATE hobby SET category='Creative' WHERE category NOT IN ('Creative', 'Physical', 'Intellectual')"
            )
            connection.execute("UPDATE hobby SET icon='🎯' WHERE icon IS NULL OR TRIM(icon)=''")

            connection.execute("UPDATE hobby SET created_at=CURRENT_TIMESTAMP WHERE created_at IS NULL")
            connection.execute("UPDATE hobby SET updated_at=created_at WHERE updated_at IS NULL")

        if _table_exists(connection, "quest"):
            _add_column_if_missing(connection, "quest", "created_at", "created_at TEXT")
            _add_column_if_missing(connection, "quest", "description", "description TEXT")
            _add_column_if_missing(connection, "quest", "status", "status TEXT DEFAULT 'To Do'")
            _add_column_if_missing(connection, "quest", "is_completed", "is_completed INTEGER DEFAULT 0")
            _add_column_if_missing(connection, "quest", "hours_spent", "hours_spent REAL DEFAULT 0")
            _add_column_if_missing(connection, "quest", "updated_at", "updated_at TEXT")
            _add_column_if_missing(connection, "quest", "completed_at", "completed_at TEXT")

            quest_columns = _table_columns(connection, "quest")
            if "is_completed" in quest_columns and "status" in quest_columns:
                connection.execute(
                    "UPDATE quest SET status='Done' WHERE is_completed=1 AND (status IS NULL OR TRIM(status)='' OR status='To Do')"
                )
                connection.execute(
                    "UPDATE quest SET status='To Do' WHERE is_completed=0 AND (status IS NULL OR TRIM(status)='')"
                )

            connection.execute(
                "UPDATE quest SET title='Untitled Quest' WHERE title IS NULL OR TRIM(title)=''"
            )
            connection.execute(
                "UPDATE quest SET difficulty='Medium' WHERE difficulty IS NULL OR TRIM(difficulty)=''"
            )
            connection.execute(
                "UPDATE quest SET difficulty='Medium' WHERE difficulty NOT IN ('Easy', 'Medium', 'Hard')"
            )
            connection.execute("UPDATE quest SET status='To Do' WHERE status IS NULL OR TRIM(status)=''")
            connection.execute(
                "UPDATE quest SET status='To Do' WHERE status NOT IN ('To Do', 'Doing', 'Done')"
            )
            connection.execute("UPDATE quest SET is_completed=1 WHERE status='Done'")
            connection.execute("UPDATE quest SET is_completed=0 WHERE status IN ('To Do', 'Doing')")
            connection.execute("UPDATE quest SET xp_value=0 WHERE xp_value IS NULL")
            connection.execute("UPDATE quest SET hours_spent=0 WHERE hours_spent IS NULL")

            connection.execute("UPDATE quest SET created_at=CURRENT_TIMESTAMP WHERE created_at IS NULL")
            connection.execute("UPDATE quest SET updated_at=created_at WHERE updated_at IS NULL")
            connection.execute(
                "UPDATE quest SET completed_at=updated_at WHERE status='Done' AND completed_at IS NULL"
            )

        connection.commit()


def create_db_and_tables():
    """Create tables at startup and migrate any legacy schema/data first."""
    migrate_legacy_schema()
    SQLModel.metadata.create_all(engine)


def get_session():
    """Yield a DB session for FastAPI dependency injection in API routes."""
    with Session(engine) as session:
        yield session