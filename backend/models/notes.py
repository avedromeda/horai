from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.orm import relationship

from backend import db


# M-N tables
subject_notes = db.Table(
    "subjects_notes",
    db.Column("subject_id", db.Integer, db.ForeignKey("subjects.id"), primary_key=True),
    db.Column("note_id", db.Integer, db.ForeignKey("notes.id"), primary_key=True),
)

notes_labels = db.Table(
    "notes_labels",
    db.Column("note_id", db.Integer, db.ForeignKey("notes.id"), primary_key=True),
    db.Column("label_id", db.Integer, db.ForeignKey("labels.id"), primary_key=True),
)


# Individual tables
class Subject(db.Model):
    __tablename__ = "subjects"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    user = relationship("User", back_populates="subjects")
    
    notes = relationship("Note", secondary=subject_notes)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "user_id": self.user_id,
            "notes": [
                note.to_dict() for note in self.notes
            ]
        }
    

class Note(db.Model):
    __tablename__ = "notes"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String)
    content = db.Column(db.String)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    user = relationship("User", back_populates="notes")
    
    labels = relationship("Label", secondary=notes_labels)
    label_names = association_proxy("labels", "name")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "user_id": self.user_id,
            "labels": [
                label.to_dict() for label in self.labels
            ],
            "label_names": self.label_names
        }


class Label(db.Model):
    __tablename__ = "labels"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    color = db.Column(db.Integer, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    user = relationship("User", back_populates="labels")
    
    notes = relationship("Note", secondary=notes_labels)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "color": self.color,
            "user_id": self.user_id
        }