from pydantic import BaseModel,Field,EmailStr

class RegisterSeller(BaseModel):
    name : str
    phone : str
    mail : EmailStr
    password : str=Field(min_length=6)
    shopname : str
    gstnumber : int
    address : str

