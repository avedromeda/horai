from backend.models.notes import Label, Note
from flask import g
from flask_restful import abort

from . import Subject


def abort_for_subject(subject_id: int):
    subject = Subject.query.get(subject_id)
    if subject:
        # Ensure owner
        if subject.user == g.user or g.user.admin_features:
            return subject
        
        abort(403, message=f"This is not your subject")
    
    abort(404, message=f"Subject {subject_id} does not exist.")


def abort_for_note(subject_id: int, note_id: int):
    note = Note.query.get(note_id)
    if note:
        # Ensure subject
        if note.subject_id != subject_id:
            abort(404, message="This note does not belong to this subject")
        
        # Ensure owner
        if note.user == g.user or g.user.admin_features:
            return note
        
        abort(403, message=f"This is not your note")
    
    abort(404, message=f"Note {note_id} does not exist.")


def abort_for_label(label_id: int):
    label = Label.query.get(label_id)
    if label:
        # Ensure owner
        if label.user == g.user or g.user.admin_features:
            return label
        
        abort(403, message=f"This is not your label")
    
    abort(404, message=f"Label {label_id} does not exist.")