from pydantic import BaseModel,Field,EmailStr
import enum

class UserRole(str, enum.Enum):
     USER= "user"
     SELLER= "seller"

class RegisterUser(BaseModel):
    name : str
    phone : str
    mail : EmailStr
    password : str=Field(min_length=6)


class LoginUser(BaseModel):
    mail : EmailStr
    password : str