from sqlmodel import Session

from database import engine
from models import Hobby, Quest


def seed_data():
    with Session(engine) as session:
        hobby1 = Hobby(name="Photography", category="Creative", description="Mastering manual mode...", icon="📸")
        hobby2 = Hobby(name="Bouldering", category="Physical", description="Climbing indoor routes", icon="🧗")

        session.add(hobby1)
        session.add(hobby2)
        session.commit()

        q1 = Quest(title="Take 10 photos...", difficulty="Easy", hobby_id=hobby1.id)
        q2 = Quest(title="Long exposure...", difficulty="Hard", hobby_id=hobby1.id)
        q3 = Quest(title="Complete a V3 route", difficulty="Medium", hobby_id=hobby2.id)

        session.add_all([q1, q2, q3])
        session.commit()
        print("Seed data added successfully!")


if __name__ == "__main__":
    seed_data()