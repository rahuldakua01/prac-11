import os
from dotenv import load_dotenv

# Resolve the absolute path to the .env file relative to config.py
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, "..", ".env")
if not os.path.exists(env_path):
    env_path = os.path.join(current_dir, "..", "..", ".env")

load_dotenv(env_path)

APP_BASE_URL = os.getenv("APP_BASE_URL", "http://localhost:8000")
MAIL_USERNAME = os.getenv("MAIL") or os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("PASS") or os.getenv("MAIL_PASSWORD")
MAIL_FROM = os.getenv("MAIL") or os.getenv("MAIL_FROM") or os.getenv("MAIL_USERNAME")
MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")

print(f"[CONFIG] APP_BASE_URL: {APP_BASE_URL}")
print(f"[CONFIG] MAIL_USERNAME is configured: {bool(MAIL_USERNAME)}")
print(f"[CONFIG] MAIL_PASSWORD is configured: {bool(MAIL_PASSWORD)}")
print(f"[CONFIG] MAIL_SERVER: {MAIL_SERVER}:{MAIL_PORT}")