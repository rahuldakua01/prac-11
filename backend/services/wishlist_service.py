from fastapi import HTTPException
from models.wishlist import WishlistItem
from models.producr import Product
from sqlalchemy.orm import Session

def add_to_wishlist(data, current_user, db: Session):
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = db.query(WishlistItem).filter(
        WishlistItem.user_id == current_user["user_id"],
        WishlistItem.product_id == data.product_id
    ).first()

    if existing:
        return {"Message": "Product already in wishlist"}

    item = WishlistItem(
        user_id=current_user["user_id"],
        product_id=data.product_id
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"Message": "Product added to wishlist successfully"}

def get_wishlist_items(current_user, db: Session):
    items = db.query(WishlistItem).filter(
        WishlistItem.user_id == current_user["user_id"]
    ).all()
    
    return [
        {
            "wishlist_item_id": item.id,
            "product_id": item.product.id,
            "name": item.product.name,
            "price": item.product.price,
            "imageurl": item.product.imageurl
        }
        for item in items if item.product
    ]

def delete_wishlist_item(item_id, current_user, db: Session):
    item = db.query(WishlistItem).filter(
        WishlistItem.id == item_id,
        WishlistItem.user_id == current_user["user_id"]
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Wishlist item not found")

    db.delete(item)
    db.commit()
    return {"Message": "Item removed from wishlist successfully"}
