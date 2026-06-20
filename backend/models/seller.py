from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from db.base import Base


class Seller(Base):
    __tablename__ = "sellers"

    id = Column(Integer, primary_key=True, index=True)
    shopname = Column(String)
    gstnumber = Column(String)
    address = Column(String)
    role = Column(String,default="seller")
    user_id = Column(Integer,ForeignKey("users.id"))
    
    user = relationship(
        "User",
        back_populates="seller"
    )

    products = relationship(
        "Product",
        back_populates="seller",
        cascade="all, delete"
    )