import json
from models.order import Order
from models.add_product import AddProduct
from models.producr import Product
from fastapi import HTTPException
from sqlalchemy.orm import Session

def place_order(user, db: Session, data):
    cart_items = db.query(AddProduct).filter(AddProduct.user_id == user["user_id"]).all()

    if not cart_items:
        raise HTTPException(
            status_code=400,
            detail="Cart is empty"
        )

    total = 0
    items_list = []

    for item in cart_items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product '{item.name}' not found"
            )
        
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Only {product.stock} items left in stock for product '{item.name}'"
            )
        
        product.stock -= item.quantity
        total += item.price * item.quantity
        items_list.append({
            "product_id": item.product_id,
            "name": item.name,
            "price": item.price,
            "quantity": item.quantity,
            "imageurl": product.imageurl
        })

    order = Order(
        user_id=user["user_id"],
        total_amount=total,
        shipping_address=data.shipping_address,
        payment_method=data.payment_method,
        status="pending",
        items_json=json.dumps(items_list)
    )

    db.add(order)

    for item in cart_items:
        db.delete(item)

    db.commit()

    return {
        "message": "Order placed successfully",
        "total": total
    }

def order_history(current_user, db: Session):
    orders = db.query(Order).filter(Order.user_id == current_user["user_id"]).all()
    res = []
    for o in orders:
        items = []
        if o.items_json:
            try:
                items = json.loads(o.items_json)
            except Exception:
                pass
        res.append({
            "id": o.id,
            "total_amount": o.total_amount,
            "shipping_address": o.shipping_address,
            "payment_method": o.payment_method,
            "status": o.status,
            "items": items
        })
    return res

