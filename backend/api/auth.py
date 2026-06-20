from fastapi import APIRouter,Depends
from services.user_service import register_user,login_user,delete_user
from schemas.user import RegisterUser,LoginUser
from sqlalchemy.orm import Session
from core.dependencies import get_db,get_admin_required



router = APIRouter()


@router.post("/register")
def register(data:RegisterUser,db:Session=Depends(get_db)):
    return register_user(data,db)


@router.post("/login")
def login(data:LoginUser,db:Session=Depends(get_db)):
    return login_user(data,db)


@router.delete("/delete_user/{user_id}")
def delete(user_id:int,db:Session=Depends(get_db),admin_user : Session=Depends(get_admin_required)):
    return delete_user(user_id,db)
