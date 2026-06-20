from db.session import SessionLocal
from fastapi.security import HTTPAuthorizationCredentials,HTTPBearer
from fastapi import Depends,HTTPException
from core.security import SECRET_KEY,ALGORITHM
from jose import jwt,JWTError


security = HTTPBearer()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(credentials : HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials,SECRET_KEY,algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

def get_admin_required(current_user = Depends(get_current_user)):
    if current_user["role"] != "admin" :
        raise HTTPException(
            status_code=400,
            detail="Admin Required"
        )
    return current_user


def seller_required(current_user = Depends(get_current_user)):
    if current_user["role"] != "seller" :
        raise HTTPException(
            status_code=407,
            detail="Seller Required"
        )
    return current_user

def user_required(current_user = Depends(get_current_user)):
    if current_user["role"] != "user" :
        raise HTTPException(
            status_code=408,
            detail="User Required"
        )
    return current_user
