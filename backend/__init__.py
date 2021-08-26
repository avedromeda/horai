from flask import Flask
from flask_sqlalchemy import SQLAlchemy


app = None
db = None

def create_app(config = "config.py"):
    global app, db
    
    # Setup Flask
    app = Flask(__name__)
    app.config.from_pyfile(config)
    db = SQLAlchemy(app)

    # Load the database
    import backend.models
    db.create_all()

    # Load blueprints
    from backend.views import user
    app.register_blueprint(user.bp, url_prefix='/user')

    return app