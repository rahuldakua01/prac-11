from fastapi import HTTPException
from backend.models.producr import Product
from backend.models.seller import Seller
import os
from sqlalchemy.orm import Session


async def add_product(name,price,stock,image,imageurl,current_user,db):
    if current_user["role"] != "seller":
        raise HTTPException(
            status_code=405,
            detail="Access Denied"
        )
    
    seller = db.query(Seller).filter(Seller.user_id == current_user["user_id"]).first()

    if not seller:
        raise HTTPException(
            status_code=406,
            detail= "Seller Not Found"
        )
    
    if image:
        os.makedirs("upload",exist_ok=True)
        file_path = f"upload/{image.filename}"
        with open(file_path , "wb") as buffer:
            buffer.write(await image.read())
        img_val = file_path
    else:
        img_val = imageurl or 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600'

    product = Product(
        name = name,
        price = price,
        stock = stock,
        imageurl = img_val,
        seller_id = seller.id
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return {"Message" : "Product add Successfully"}



def delete_product(product_id, current_user, db: Session):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not Found"
        )

    if current_user["role"] == "admin":
        db.delete(product)
        db.commit()
        return {"Message": "Product Deleted Successfully by Admin"}


    elif current_user["role"] == "seller":
        seller = db.query(Seller).filter(Seller.user_id == current_user["user_id"]).first()
        if not seller or product.seller_id != seller.id:
            raise HTTPException(
                status_code=403,
                detail="Not authorized to delete this product"
            )
        db.delete(product)
        db.commit()
        return {"Message": "Product Deleted Successfully"}

    else:
        raise HTTPException(
            status_code=403,
            detail="Access Denied"
        )
