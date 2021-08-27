from typing import List
from backend import db
from backend.authenticate import gen_auth_token, is_admin, is_authenticated
from backend.models.user import User
from flask import Blueprint, request, g

bp = Blueprint("user", __name__)


@bp.route("/login/", methods=["POST"])
def login():
    # If already logged in, just pass by
    if g.user is not None:
        return {}, 200
    
    email = request.form.get("email")
    password = request.form.get("password")

    user = User.query.filter_by(email=email).first()
    if user:
        # Check password
        if user.check_password(password):
            # Generate JWT
            return {
                "jwt": gen_auth_token(user.id)
            }, 200
        
        # Wrong password
        return {"error": "Incorrect details"}, 403
    
    # User not found
    return {"error": "That user does not exist"}, 400


@bp.route("/create/", methods=["POST"])
def create():
    name = request.form.get("name", "")
    email = request.form.get("email", "")
    password = request.form.get("password", "")
    confirm_password = request.form.get("confirm_password")

    # Ensure data isn't empty
    if any(val.strip() == "" for val in [name, email, password]):
        return {
            "error": "Information can not be empty"
        }, 400

    # Make sure account doesn't exist already
    user = User.query.filter_by(email=email).first()
    if user:
        return {
            "error": "This account already exists"
        }, 403
    
    if password != confirm_password:
        return {
            "error": "These passwords do not match"
        }, 403

    user = User(
        name=name,
        email=email
    )

    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return {
        "jwt": gen_auth_token(user.id)
    }


@bp.route("/list/", methods=["GET"])
@is_admin
@is_authenticated
def list_(): 
    users: List[User] = User.query.all()
    data_users = []
    for user in users:
        data_users.append(user.to_dict())
    
    return {"users": data_users}


@bp.route("/me/", methods=["GET"])
@is_authenticated
def me():
    return g.user.to_dict()