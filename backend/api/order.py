import json
from fastapi import APIRouter, Depends, HTTPException
from schemas.order import CreateOrder
from services.order_service import place_order,order_history
from core.dependencies import get_current_user,get_db,user_required,get_admin_required
from sqlalchemy.orm import Session
from models.order import Order
from models.user import User
from pydantic import BaseModel

router = APIRouter(prefix="/order",tags=["Order"])


@router.post("/place")
def create_order(data: CreateOrder,current_user=Depends(user_required),db=Depends(get_db)):
    return place_order(
        current_user,
        db,
        data
    )

@router.get("/order_history")
def history(current_user=Depends(user_required),db:Session=Depends(get_db)):
    return order_history(current_user,db)

class UpdateOrderStatus(BaseModel):
    status: str

@router.get("/all")
def get_all_orders(admin_user=Depends(get_admin_required), db: Session = Depends(get_db)):
    orders = db.query(Order).all()
    res = []
    for o in orders:
        user = db.query(User).filter(User.id == o.user_id).first()
        items = []
        if o.items_json:
            try:
                items = json.loads(o.items_json)
            except Exception:
                pass
        res.append({
            "id": o.id,
            "user": user.mail if user else "Unknown",
            "total_amount": o.total_amount,
            "shipping_address": o.shipping_address,
            "status": o.status,
            "payment_method": o.payment_method,
            "items": items
        })
    return res

@router.put("/status/{order_id}")
def update_order_status(order_id: int, data: UpdateOrderStatus, admin_user=Depends(get_admin_required), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = data.status
    db.commit()
    return {"message": "Order status updated successfully", "status": order.status}
