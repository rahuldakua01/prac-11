from sqlalchemy import Column,Integer,String,Boolean
from db.base import Base

from sqlalchemy.orm import relationship


class User(Base):

    __tablename__ = "users"

    id = Column(Integer,primary_key=True,index=True)
    name = Column(String,nullable=False)
    phone = Column(String,unique=True,nullable=False)
    mail = Column(String,unique=True,nullable=False)
    role = Column(String,default="user")
    password = Column(String,nullable=False)

    
    seller = relationship(
        "Seller",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    user_cart = relationship(
            "AddProduct",
            back_populates="users",
            cascade="all, delete-orphan"
    )

    orders = relationship(
            "Order",
            back_populates="user",
            cascade="all, delete-orphan"
    )

    wishlist_items = relationship(
        "WishlistItem",
        back_populates="user",
        cascade="all, delete-orphan"
    )



