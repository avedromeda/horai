import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", os.urandom(16))
SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI", "sqlite:///:memory:")
SQLALCHEMY_TRACK_MODIFICATIONS = False
JWT_SECRET = os.getenv("JWT_SECRET", os.urandom(16))

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")

DEFAULT_EMAIL_VERIF_CONTENT = """
Welcome to Horai, to verify your email please click on the following link (temporarily valid)

https://horai.yadamiel.com/api/user/verify?token={token}
"""
EMAIL_VERIF_CONTENT = os.getenv("EMAIL_VERIF_CONTENT", DEFAULT_EMAIL_VERIF_CONTENT)