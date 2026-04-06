import os
from pathlib import Path

from fastapi_mail import ConnectionConfig, FastMail, MessageSchema
from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")


async def send_otp_email(to_email: str, otp: str) -> bool:
    """
    Send a 6-digit OTP to the user's email.
    Falls back to console output if SMTP is not configured.
    """
    smtp_user = (os.getenv("SMTP_USER") or "").strip()
    smtp_password = (os.getenv("SMTP_PASSWORD") or "").strip()

    if not smtp_user or not smtp_password:
        print("\n" + "=" * 60)
        print("OTP EMAIL (DEV MODE)")
        print(f"To: {to_email}")
        print(f"Your OTP for FitPeak password reset is: {otp}")
        print("This OTP expires in 10 minutes.")
        print("=" * 60 + "\n")
        return True

    conf = ConnectionConfig(
        MAIL_USERNAME=smtp_user,
        MAIL_PASSWORD=smtp_password,
        MAIL_FROM=os.getenv("SMTP_FROM", "noreply@fitpeak.com"),
        MAIL_PORT=int(os.getenv("SMTP_PORT", 587)),
        MAIL_SERVER=os.getenv("SMTP_HOST", "smtp.gmail.com"),
        MAIL_STARTTLS=True,
        MAIL_SSL_TLS=False,
    )

    html = f"""
    <div style="font-family: sans-serif; background-color: #020617; color: white; padding: 40px; border-radius: 20px;">
        <h1 style="color: #22d3ee; margin-bottom: 24px;">FitPeak Password Reset</h1>
        <p style="font-size: 16px; color: #94a3b8; line-height: 1.6;">
            You requested to reset your password. Use the OTP below to proceed.
        </p>
        <div style="margin: 40px 0; text-align: center;">
            <span style="background-color: #22d3ee; color: black; padding: 16px 32px; border-radius: 12px; font-weight: bold; font-size: 32px; letter-spacing: 8px;">
                {otp}
            </span>
        </div>
        <p style="font-size: 14px; color: #64748b;">
            This OTP is valid for 10 minutes. If you didn't request this, ignore this email.
        </p>
    </div>
    """

    message = MessageSchema(
        subject="FitPeak Password Reset OTP",
        recipients=[to_email],
        body=html,
        subtype="html",
    )

    try:
        fm = FastMail(conf)
        await fm.send_message(message)
        print(f"[SUCCESS] OTP email sent to {to_email}")
        return True
    except Exception as exc:
        print(f"[ERROR] Failed to send OTP email: {exc}")
        return False