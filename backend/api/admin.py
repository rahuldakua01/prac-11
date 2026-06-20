from fastapi import Depends,APIRouter
from backend.core.dependencies import get_admin_required, get_db
from sqlalchemy.orm import Session
from backend.models.user import User

router = APIRouter(prefix="/admin",tags=["Admin"])

@router.get("/dashbord")
def admin_dashbord(admin_user = Depends(get_admin_required)):
    return {"Message" : "Welcome Admin"}

@router.get("/users")
def list_users(admin_user=Depends(get_admin_required), db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.mail,
            "phone": u.phone,
            "role": u.role
        }
        for u in users
    ]
