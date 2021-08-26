import os

SECRET_KEY = os.getenv("SECRET_KEY", os.urandom(16))
SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI", "sqlite:///:memory:")
JWT_SECRET = os.getenv("JWT_SECRET", os.urandom(16))