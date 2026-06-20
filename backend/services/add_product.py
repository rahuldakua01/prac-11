from fastapi import HTTPException
from models.producr import Product
from models.add_product import AddProduct
from models.producr import Product
from schemas.add_product import AddToCart
from models.user import User

def add_to_cart(data,current_user, db):

    product = db.query(Product).filter(Product.name == data.name).first()
    users = db.query(User).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    if product.stock < data.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Only {product.stock} items available"
        )

    cart_item = AddProduct(
        product_id=product.id,
        user_id=current_user["user_id"],
        name=product.name,
        price=product.price,
        quantity=data.quantity
    )

    db.add(cart_item)
    db.commit()
    db.refresh(cart_item)

    return {
        "message": "Product added to cart",
        "product": product.name
    }

def get_cart_items(current_user, db):
    cart_items = db.query(AddProduct).filter(AddProduct.user_id == current_user["user_id"]).all()
    return cart_items

def update_item(item_id,data,current_user,db):
    item = db.query(AddProduct).filter(AddProduct.id == item_id,AddProduct.user_id == current_user["user_id"]).first()
    if not item:
        raise HTTPException(
            status_code=409,
            detail="Cart item not found"
            )
    

    product = db.query(Product).filter(Product.id == item.product_id).first()
    if product.stock < data.quantity:
        raise HTTPException(status_code=400, detail=f"Only {product.stock} items left in stock")

    item.quantity = data.quantity
    db.commit()
    db.refresh(item)

    return {"Message" : "Updated Successfully"}


def delete_item(item_id,current_user,db):
    item = db.query(AddProduct).filter((AddProduct.id == item_id) & (AddProduct.user_id == current_user["user_id"])).first()

    if not item:
        raise HTTPException(
            status_code=409,
            detail="Cart item not found"
            )
    
    db.delete(item)
    db.commit()

    return {"Message" : "Item Deleted Successfully"}
