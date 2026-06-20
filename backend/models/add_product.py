from db.base import Base
from sqlalchemy import Column,Integer,String,ForeignKey
from sqlalchemy.orm import relationship

class AddProduct(Base):
    __tablename__ = "user_cart"

    id = Column(Integer,primary_key=True,index=False)
    product_id = Column(Integer,ForeignKey("products.id"))
    user_id = Column(Integer,ForeignKey("users.id"))
    name = Column(String,nullable=False)
    price = Column(Integer,nullable=False)
    quantity = Column(Integer,nullable=False)


    users = relationship(
            "User",
            back_populates="user_cart"
    )

    product = relationship(
        "Product",
        back_populates="cart_items"
    )