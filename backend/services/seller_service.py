from sqlalchemy.orm import Session
from backend.models.user import User
from backend.models.seller import Seller
from backend.schemas.user import UserRole
from fastapi import HTTPException
from backend.core.security import get_hash_password


def register_seller(data,db:Session):
    user = db.query(User).filter((User.mail == data.mail) | (User.phone == data.phone)).first()

    if user:
        raise HTTPException(
            status_code=400,
            detail="Seller already Exist"
        )
    
    hashed_password = get_hash_password(data.password)

    user = User(
        name = data.name,
        phone = data.phone,
        mail = data.mail,
        password = hashed_password,
        role=UserRole.SELLER.value,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    seller = Seller(
        user_id = user.id,
        shopname = data.shopname,
        gstnumber = data.gstnumber,
        address = data.address
    )

    db.add(seller)
    db.commit()
    db.refresh(seller)


    return{"Message" : "Seller Registration Successfully"}



def delete_seller(user_id,db:Session):
    existing_seller = db.query(User).filter(User.id == user_id).first()

    if not existing_seller:
        raise HTTPException(
            status_code=403,
            detail="User not Found"
        )
    db.delete(existing_seller)
    db.commit()
    

    return {"Message" : "Seller Deleted Successfully"}


