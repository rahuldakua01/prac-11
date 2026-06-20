from db.base import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer,ForeignKey("users.id"))
    total_amount = Column(Integer, nullable=False)
    shipping_address = Column(String, nullable=False)
    payment_method = Column(String, nullable=False)
    status = Column(String,default="pending")
    items_json = Column(String, nullable=True)

    user = relationship(
        "User",
        back_populates="orders"
    )