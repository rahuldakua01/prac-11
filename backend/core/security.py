from datetime import datetime,timedelta,timezone
from dotenv import load_dotenv
import os
from pwdlib import PasswordHash
from jose import jwt,JWTError

load_dotenv()

password_hash = PasswordHash.recommended()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def get_hash_password(password):
    return password_hash.hash(password)

def verify_password(plain_password,hash_password):
    return password_hash.verify(plain_password,hash_password)

def create_access_token(data:dict , expire_delta : timedelta | None=None):
    to_encoded = data.copy()

    if expire_delta:
        expire = (
            datetime.now(timezone.utc)+expire_delta
        )
    else:
        expire = (
            datetime.now(timezone.utc)+timedelta(minutes=15)
        )
    to_encoded.update({"exp" : expire})

    encoded_jwt = jwt.encode(to_encoded,SECRET_KEY,ALGORITHM)

    return encoded_jwt


def access_token(token:str):
    try:
        payload = jwt.decode(token,SECRET_KEY,ALGORITHM)
        return payload
    except JWTError:
        return None