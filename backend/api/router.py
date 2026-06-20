from fastapi import APIRouter
from backend.api import admin,auth,seller,order,addcart,wishlist


api_router = APIRouter()


api_router.include_router(auth.router)
api_router.include_router(admin.router)
api_router.include_router(seller.router)
api_router.include_router(addcart.router)
api_router.include_router(wishlist.router)
api_router.include_router(order.router)
