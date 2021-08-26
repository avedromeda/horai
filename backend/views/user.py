from typing import List
from flask.json import jsonify
from backend import db
from backend.authenticate import gen_auth_token, is_authenticated
from backend.models.user import User
from flask import Blueprint, request, session

bp = Blueprint("user", __name__)


@bp.route("/login", methods=["POST"])
def login():
    # If already logged in, just pass by
    if session["user"] is not None:
        return jsonify({}), 200
    
    email = request.form.get("email")
    password = request.form.get("password")

    user = User.query.filter_by(email=email).first()
    if user:
        # Check password
        if user.check_password(password):
            # Generate JWT
            return jsonify({
                "jwt": gen_auth_token(user.id),
                "user_id": user.id
            }), 200
        
        # Wrong password
        return jsonify({"error": "Incorrect details"}), 403
    
    # User not found
    return jsonify({"error": "That user does not exist"}), 400


@bp.route("/create", methods=["POST"])
def create():
    name = request.form.get("name", "")
    email = request.form.get("email", "")
    password = request.form.get("password", "")
    confirm_password = request.form.get("confirm_password")

    # Ensure data isn't empty
    if any(val.strip() == "" for val in [name, email, password]):
        return jsonify({
            "error": "Information can not be empty"
        }), 400

    # Make sure account doesn't exist already
    user = User.query.filter_by(email=email).first()
    if user:
        return jsonify({
            "error": "This account already exists"
        }), 403
    
    if password != confirm_password:
        return jsonify({
            "error": "These passwords do not match"
        }), 403

    user = User(
        name=name,
        email=email
    )

    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "jwt": gen_auth_token(user.id)
    })


@bp.route("/list", methods=["GET"])
@is_authenticated
def list_(): 
    users: List[User] = User.query.all()
    data_users = []
    for user in users:
        data_users.append(user.to_dict())
    
    return jsonify({"users": data_users}), 200