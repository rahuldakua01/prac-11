from fastapi import HTTPException
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from core.config import (
    APP_BASE_URL,
    MAIL_FROM,
    MAIL_PASSWORD,
    MAIL_PORT,
    MAIL_SERVER,
    MAIL_USERNAME,
)
import asyncio
import random
import datetime
from smtplib import SMTP
from email.message import EmailMessage

OTP_STORE: dict = {}
OTP_TTL_SECONDS = 300  # 5 minutes


def get_mail_config():
    if not MAIL_USERNAME or "@" not in MAIL_USERNAME or not MAIL_PASSWORD:
        raise HTTPException(
            status_code=500,
            detail="Email settings are invalid. Set MAIL to a real email address and PASS to a Gmail app password in backend/.env.",
        )

    try:
        return ConnectionConfig(
            MAIL_USERNAME=MAIL_USERNAME,
            MAIL_PASSWORD=MAIL_PASSWORD,
            MAIL_FROM=MAIL_FROM,
            MAIL_PORT=MAIL_PORT,
            MAIL_SERVER=MAIL_SERVER,
            MAIL_STARTTLS=True,
            MAIL_SSL_TLS=False,
            USE_CREDENTIALS=True,
            VALIDATE_CERTS=True,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Email settings are invalid. Set MAIL to a real email address and PASS to a Gmail app password in backend/.env.",
        ) from exc


def build_verification_url(token: str):
    return f"{APP_BASE_URL}/verification?token={token}"


async def send_verification_email(email: str, token: str):
    verification_url = build_verification_url(token)
    print(f"\n--- VERIFICATION LINK FOR {email}: {verification_url} ---\n")

    msg = EmailMessage()
    msg["Subject"] = "Verify your account"
    msg["From"] = MAIL_USERNAME if MAIL_FROM is None else MAIL_FROM
    msg["To"] = email
    
    body = f"Hello,\n\nThanks for registering. Please click on the link below to verify your email and complete your registration:\n\n{verification_url}\n\nIf you did not register, please ignore this email."
    msg.set_content(body)

    def _send():
        with SMTP(MAIL_SERVER, MAIL_PORT) as smtp:
            smtp.starttls()
            smtp.login(MAIL_USERNAME, MAIL_PASSWORD)
            smtp.send_message(msg)

    try:
        await asyncio.to_thread(_send)
    except Exception as exc:
        print(f"[MAIL SYSTEM ERROR] Failed to send verification email: {exc}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="Verification email could not be sent. Check Gmail app password, SMTP access, and internet connection.",
        ) from exc


def _generate_otp(length: int = 6) -> str:
    """Generate a numeric OTP of given length as a zero-padded string."""
    start = 10 ** (length - 1)
    end = (10 ** length) - 1
    return str(random.randint(start, end))


def _store_otp(email: str, otp: str, ttl: int = OTP_TTL_SECONDS) -> None:
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(seconds=ttl)
    OTP_STORE[email] = (otp, expires_at)


async def send_otp_email(email: str, length: int = 6, ttl: int = OTP_TTL_SECONDS) -> None:
    """Generate an OTP, store it temporarily, and send it via SMTP to the given email.

    Uses `MAIL_USERNAME` and `MAIL_PASSWORD` from config. Raises HTTPException on failure.
    """
    if not MAIL_USERNAME or not MAIL_PASSWORD:
        raise HTTPException(status_code=500, detail="SMTP credentials are not configured.")

    otp = _generate_otp(length)
    _store_otp(email, otp, ttl)

    subject = "Your verification code"
    body = f"Your verification code is: {otp}\nThis code will expire in {ttl // 60} minutes."

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = MAIL_USERNAME if MAIL_FROM is None else MAIL_FROM
    msg["To"] = email
    msg.set_content(body)

    def _send():
        try:
            with SMTP(MAIL_SERVER, MAIL_PORT) as smtp:
                smtp.starttls()
                smtp.login(MAIL_USERNAME, MAIL_PASSWORD)
                smtp.send_message(msg)
        except Exception as exc:
            # remove stored OTP on failure
            OTP_STORE.pop(email, None)
            raise

    try:
        await asyncio.to_thread(_send)
    except Exception as exc:
        print(f"[MAIL SYSTEM ERROR] Failed to send OTP email: {exc}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Could not send OTP email.") from exc


def verify_otp(email: str, otp: str) -> bool:
    """Verify the provided OTP for the email. Returns True if valid, False otherwise.

    Raises HTTPException for expired codes.
    """
    data = OTP_STORE.get(email)
    if not data:
        return False

    stored_otp, expires_at = data
    if datetime.datetime.utcnow() > expires_at:
        OTP_STORE.pop(email, None)
        raise HTTPException(status_code=400, detail="OTP has expired.")

    if stored_otp == otp:
        OTP_STORE.pop(email, None)
        return True

    return False
