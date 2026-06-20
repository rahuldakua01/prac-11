from pydantic import BaseModel

class AddToWishlist(BaseModel):
    product_id: int
