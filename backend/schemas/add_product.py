from pydantic import BaseModel

class AddToCart(BaseModel):
    name : str
    quantity : int


class Update(BaseModel):
    quantity : int