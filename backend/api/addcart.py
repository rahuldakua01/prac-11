from fastapi import APIRouter,Depends
from services.add_product import add_to_cart,get_cart_items,update_item,delete_item
from schemas.add_product import AddToCart,Update
from models.user import User
from sqlalchemy.orm import Session
from core.dependencies import get_db,user_required


router = APIRouter(prefix="/add_to_cart",tags=["Shopping Cart"])



@router.post("/addtocart")
def add_cart(data:AddToCart,db:Session=Depends(get_db),user_re : Session=Depends(user_required)):
    return add_to_cart(data,user_re,db)

@router.get("/cart")
def view_cart(current_user:Session=Depends(user_required),db: Session = Depends(get_db)):
    return get_cart_items(current_user,db)

@router.put("/update/{item_id}")
def update(item_id:int,data:Update,current_user : Session=Depends(user_required),db:Session=Depends(get_db)):
    return update_item(item_id,data,current_user,db)

@router.delete("/delete_item/{item_id}")
def delete(item_id : int,current_user : Session=Depends(user_required),db:Session=Depends(get_db)):
    return delete_item(item_id,current_user,db)
