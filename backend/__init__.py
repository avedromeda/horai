from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api


app = None
api = None
db = None

def create_app(config = "config.py"):
    global app, api, db
    
    # Setup Flask
    app = Flask(__name__)
    app.config.from_pyfile(config)
    db = SQLAlchemy(app)
    api = Api(app)

    # Load the database
    import backend.models
    db.create_all()

    # Load blueprints
    from backend.views import user, subject
    app.register_blueprint(user.bp, url_prefix='/user')
    # app.register_blueprint(subject.bp, url_prefix='/subject')

    api.add_resource(subject.SubjectList, '/subjects')
    api.add_resource(subject.SubjectResource, '/subject/<int:subject_id>')

    return app