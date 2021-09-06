__version__ = "0.3.0-rc.2"

import os

from flask import Flask
from flask.helpers import send_from_directory
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

app = None
migrate = None
api = None
db = None


def create_app(config="config.py"):
    global app, api, db

    # Setup Flask
    app = Flask(__name__)
    app.config.from_pyfile(config)
    db = SQLAlchemy(app)
    migrate = Migrate(app, db)
    api = Api(app)

    # Load the database
    import backend.models

    db.create_all()

    # Load blueprints
    from backend.views import label, note, subject, user

    app.register_blueprint(user.bp, url_prefix="/api/user/")

    api.add_resource(subject.SubjectList, "/api/subjects/")
    api.add_resource(subject.SubjectResource, "/api/subject/<int:subject_id>/")
    api.add_resource(note.NoteList, "/api/subject/<int:subject_id>/notes/")
    api.add_resource(note.NoteResource, "/api/subject/<int:subject_id>/note/<int:note_id>/")
    api.add_resource(label.LabelList, "/api/labels/")
    api.add_resource(label.LabelResource, "/api/label/<int:label_id>/")

    root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend")

    @app.route("/<path:path>", methods=["GET"])
    def static_proxy(path):
        return send_from_directory(root, path)

    @app.route("/", methods=["GET"])
    def redirect_to_index():
        return send_from_directory(root, "index.html")

    @app.after_request
    def after_request(response):
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add(
            "Access-Control-Allow-Headers", "Content-Type,Authorization,X-Authenticate"
        )
        response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE")
        return response

    return app
