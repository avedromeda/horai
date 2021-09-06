import smtplib
import ssl
from typing import List

from backend import config, db
from backend.authenticate import (check_email_token, gen_auth_token,
                                  gen_email_verif_token, is_admin,
                                  is_authenticated,
                                  is_authenticated_not_verified)
from backend.models.user import User
from flask import Blueprint, g, request, redirect
from flask.helpers import make_response, url_for

bp = Blueprint("user", __name__)
MAX_AGE = 31 * 24 * 60 * 60


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
            resp = make_response()
            resp.set_cookie(
                "token",
                gen_auth_token(user.id),
                httponly=True,
                secure=True,
                max_age=MAX_AGE,
            )
            return resp, 204

        # Wrong password
        return {"error": "Incorrect details"}, 403

    # User not found
    return {"error": "That user does not exist"}, 400


@bp.route("/logout/", methods=["POST"])
def logout():
    resp = make_response()
    resp.delete_cookie("token")
    return resp, 204


@bp.route("/create/", methods=["POST"])
def create():
    name = request.form.get("name", "")
    email = request.form.get("email", "")
    password = request.form.get("password", "")
    confirm_password = request.form.get("confirm_password")

    # Ensure data isn't empty
    if any(val.strip() == "" for val in [name, email, password]):
        return {"error": "Information can not be empty"}, 400

    # Make sure account doesn't exist already
    user = User.query.filter_by(email=email).first()
    if user:
        return {"error": "This account already exists"}, 403

    if password != confirm_password:
        return {"error": "These passwords do not match"}, 403

    user = User(name=name, email=email)

    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    resp = make_response()
    resp.set_cookie(
        "token", gen_auth_token(user.id), httponly=True, secure=True, max_age=MAX_AGE
    )
    return resp, 204


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
@is_authenticated_not_verified
def me():
    return g.user.to_dict()


@bp.route("/send-verify/", methods=["POST"])
@is_authenticated_not_verified
def send_verify():
    token = gen_email_verif_token(g.user.email)

    # Create ctx
    context = ssl.create_default_context()

    try:
        server = smtplib.SMTP(config.SMTP_SERVER, config.SMTP_PORT)
        server.starttls(context=context)
        server.login(config.SENDER_EMAIL, config.SENDER_PASSWORD)

        server.sendmail(
            config.SENDER_EMAIL,
            g.user.email,
            config.EMAIL_VERIF_CONTENT.format(token=token)
        )
    except:
        return {
            "error": "An error occured while sending the email (is the email valid?)"
        }, 401
    finally:
        server.quit()

    return {"token": token}


@bp.route("/verify/", methods=["GET"])
def verify():
    email = check_email_token(request.args.get("token"))
    if email:
        user = User.query.filter_by(email=email).first()
        if user:
            user.verified_email = True
            db.session.commit()

    return redirect(url_for("redirect_to_index"))
