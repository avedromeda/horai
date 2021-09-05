import hashlib
import os
from datetime import datetime

from backend import db
from sqlalchemy.orm import relationship


class User(db.Model):
    """
    User class that manages users and passwords
    """
    __tablename__ = "users"
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    email = db.Column(db.String)
    password = db.Column(db.LargeBinary)

    verified_email = db.Column(db.Boolean, default=False)
    premium_features = db.Column(db.Boolean, default=False)
    admin_features = db.Column(db.Boolean, default=False)

    subjects = relationship("Subject", back_populates="user", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="user", cascade="all, delete-orphan")
    labels = relationship("Label", back_populates="user", cascade="all, delete-orphan")

    created_on = db.Column(db.DateTime, server_default=db.func.now())
    updated_on = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    

    def set_password(self, password: str = None):
        if password is None:
            self.password = None
        else:
            salt = os.urandom(32)
            key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)

            self.password = salt + key
    
    def check_password(self, password: str) -> bool:
        salt = self.password[:32]
        key = self.password[32:]

        new_key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
        
        return key == new_key
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "verified_email": self.verified_email,
            "premium_features": self.premium_features,
            "admin_features": self.admin_features,
            "created_on": datetime.timestamp(self.created_on),
            "updated_on": datetime.timestamp(self.updated_on)
        }
