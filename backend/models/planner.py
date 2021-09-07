from datetime import datetime

from backend import db

event_labels = db.Table(
    "event_labels",
    db.Column("event_id", db.Integer, db.ForeignKey("events.id"), primary_key=True),
    db.Column("label_id", db.Integer, db.ForeignKey("labels.id"), primary_key=True),
)


# Individual tables
class Event(db.Model):
    __tablename__ = "events"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String)
    content = db.Column(db.String)
    color = db.Column(db.Integer)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))

    start_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime, nullable=True)
    all_day = db.Column(db.Boolean, default=False)

    created_on = db.Column(db.DateTime, server_default=db.func.now())
    updated_on = db.Column(
        db.DateTime, server_default=db.func.now(), onupdate=db.func.now()
    )

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "start_time": self.start_time,
            "end_time": self.start_time,
            "all_day": self.all_day,
            "user_id": self.user_id,
            "created_on": datetime.timestamp(self.created_on),
            "updated_on": datetime.timestamp(self.updated_on),
        }
