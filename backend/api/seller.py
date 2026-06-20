from fastapi import APIRouter,Depends,Form,UploadFile,File
from schemas.seller import RegisterSeller
from sqlalchemy.orm import Session
from core.dependencies import get_db,get_admin_required,get_current_user,seller_required
from services.seller_service import register_seller,delete_seller
from services.product_service import add_product,delete_product


from typing import Optional

router = APIRouter(prefix="/seller",tags=["Seller"])


@router.post("/seller_register")
def register(data:RegisterSeller,db:Session=Depends(get_db)):
    return register_seller(data,db)


@router.delete("/seller_delete/{seller_id}")
def delete(seller_id:int,db:Session=Depends(get_db),admin_user : Session=Depends(get_admin_required)):
    return delete_seller(seller_id,db)


@router.post("/add_product")
async def create_product(
    name : str=Form(...),
    price : float=Form(...),
    stock : int=Form(...),
    image : Optional[UploadFile]=File(None),
    imageurl : Optional[str]=Form(None),
    current_user : Session=Depends(get_current_user),
    db : Session=Depends(get_db)
):
    return await add_product(
        name = name,
        price = price,
        stock = stock,
        image = image,
        imageurl = imageurl,
        current_user = current_user,
        db = db
    )


@router.delete("/product_delete/{product_id}")
def product_delete(product_id : int, db:Session=Depends(get_db),seller_user : Session=Depends(get_current_user)):
    return delete_product(product_id,seller_user,db)
