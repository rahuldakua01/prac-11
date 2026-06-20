from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.dependencies import get_db, user_required
from schemas.wishlist import AddToWishlist
from services.wishlist_service import add_to_wishlist, get_wishlist_items, delete_wishlist_item

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])

@router.post("/add")
def add(data: AddToWishlist, db: Session = Depends(get_db), current_user = Depends(user_required)):
    return add_to_wishlist(data, current_user, db)

@router.get("/view")
def view(db: Session = Depends(get_db), current_user = Depends(user_required)):
    return get_wishlist_items(current_user, db)

@router.delete("/delete/{item_id}")
def delete(item_id: int, db: Session = Depends(get_db), current_user = Depends(user_required)):
    return delete_wishlist_item(item_id, current_user, db)
