from db.base import Base
from sqlalchemy import Column,Integer,String,ForeignKey,Float
from sqlalchemy.orm import relationship

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer,primary_key=True,index=True)
    name = Column(String,nullable=False)
    price = Column(Float,nullable=False)
    stock = Column(Integer,nullable=False)
    imageurl = Column(String,nullable=False)
    seller_id = Column(Integer,ForeignKey("sellers.id"))


    seller = relationship(
            "Seller",
            back_populates="products"
    )

    cart_items = relationship(
        "AddProduct",
        back_populates="product"
    )
