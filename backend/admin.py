from db.session import engine,SessionLocal
from db.base import Base
from models.user import User
from core.security import get_hash_password

# Create all database tables if they do not exist
Base.metadata.create_all(bind=engine)

db = SessionLocal()

existing_admin = db.query(User).filter(
    User.role == "admin"
).first()

if existing_admin:
    print("Admin already exists")
else:
    admin = User(
        name="admin",
        phone=9999999999,
        mail="admin@gmail.com",
        password=get_hash_password("Admin@123"),
        role="admin"
    )

    db.add(admin)
    db.commit()

    print("Admin created")
