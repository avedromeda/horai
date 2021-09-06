import time
from functools import wraps

import jwt
from flask import current_app, request, g
from jwt.exceptions import ExpiredSignatureError, InvalidSignatureError, InvalidTokenError

from backend.models.user import User


def gen_auth_token(user_id: int, expire_time: float = 0) -> str:
    # Set default expire time if 0 to 1 month after sign in.
    if expire_time == 0:
        # hours * minutes * seconds * days
        expire_time = time.time() + 24 * 60 * 60 * 31

    return jwt.encode(
        {"sub": str(user_id), "exp": expire_time}, current_app.config.get("JWT_SECRET"), algorithm="HS256"
    )


def gen_email_verif_token(user_email: str, expire_time: float = 0) -> str:
    if expire_time == 0:
        expire_time = time.time() + 24 * 60 * 60 * 31
    
    return jwt.encode(
        {"sub": user_email, "exp": expire_time}, current_app.config.get("JWT_SECRET"), algorithm="HS256"
    )


def check_email_token(token: str) -> str:
    try:
        result = jwt.decode(token, current_app.config.get("JWT_SECRET"), algorithms=["HS256"])
    except (InvalidTokenError, InvalidSignatureError, ExpiredSignatureError):
        return None
    else:
        return result.get("sub")


def check_auth_token(token: str) -> int:
    try:
        result = jwt.decode(token, current_app.config.get("JWT_SECRET"), algorithms=["HS256"])
    except (InvalidTokenError, InvalidSignatureError, ExpiredSignatureError):
        return None
    else:
        # Check user exists
        id = int(result.get("sub"))
        user = User.query.filter_by(id=id).first()
        if user:
            return user
        
        return None

from . import app


# Setup pre-request filters
@app.before_request
def user_auth_check():
    g.user = check_auth_token(request.cookies.get("token"))


# Setup is authenticated check
def is_authenticated(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if g.user is None:
            return {"error": "You must be authenticated to do this"}, 403
        elif not g.user.verified_email:
            return {"error": "You must have validated your email to do this"}, 401
        
        return f(*args, **kwargs)
    return decorated


def is_authenticated_not_verified(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if g.user is None:
            return {"error": "You must be authenticated to do this"}, 403
        
        return f(*args, **kwargs)
    return decorated



def is_premium(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if g.user is None or not g.user.premium_features:
            return {"error": "You must be premium to do this"}, 403
        
        return f(*args, **kwargs)
    
    return decorated

    
def is_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if g.user is None or not g.user.admin_features:
            return {"error": "You must be admin to do this"}, 403
        
        return f(*args, **kwargs)
    
    return decorated