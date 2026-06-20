from pydantic import BaseModel


class CreateOrder(BaseModel):
    shipping_address: str
    payment_method: str