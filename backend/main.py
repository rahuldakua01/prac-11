from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import os

from backend.api.router import api_router
from backend.db.session import engine
from backend.core.dependencies import get_db
# from services.user_service import verify_registered_user
from backend.models.producr import Product

app = FastAPI(title="Rahul")

# React Frontend Access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # React Vite
        "http://localhost:3000",  # CRA
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

# Base.metadata.create_all(bind=engine)


os.makedirs("upload", exist_ok=True)
app.mount("/upload", StaticFiles(directory="upload"), name="upload")


current_dir = os.path.dirname(os.path.abspath(__file__))
templates_dir = os.path.join(current_dir, "templates")
templates = Jinja2Templates(directory=templates_dir)


# Root home route is handled at the bottom of the file to allow fall-through


@app.get("/products")
def list_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()

    return [
        {
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "stock": p.stock,
            "imageurl": p.imageurl,
            "seller_id": p.seller_id,
        }
        for p in products
    ]


# @app.get("/verification", response_class=HTMLResponse)
# def email_verification(
#     token: str,
#     db: Session = Depends(get_db)
# ):
#     try:
#         user = verify_registered_user(token, db)

#     except HTTPException as exc:
#         return HTMLResponse(
#             f"<h1>{exc.detail}</h1>",
#             status_code=exc.status_code,
#         )

#     return HTMLResponse(
#         f"""
#         <h1>Email verified successfully</h1>
#         <p>{user.mail} is now registered.</p>
#         """
#     )


# Serve React Frontend Static Files (Vite Build)
frontend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")

if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
else:
    @app.get("/")
    def home():
        return {"status": "backend is running (frontend build not found)"}
