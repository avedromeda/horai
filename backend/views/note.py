from typing import List
from backend import db
from backend.authenticate import is_authenticated
from backend.models._helpers import abort_for_note, abort_for_subject
from backend.models.notes import Label, Note
from flask import g
from flask_restful import Resource, reqparse

note_parser = reqparse.RequestParser()
note_parser.add_argument('title', type=str, required=True)
note_parser.add_argument('content', type=str, required=True)
note_parser.add_argument('label', type=int, required=True, action="append")


def get_valid_labels(labels: List[int]):
    return [
        label for label_id in labels
        if (label := Label.query.get(label_id))
    ]

class NoteList(Resource):
    @is_authenticated
    def get(self, subject_id: int):
        subject = abort_for_subject(subject_id)
        return {
            "notes": [
                note.to_dict() for note in subject.notes
            ]
        }

    @is_authenticated
    def post(self, subject_id: int):
        subject = abort_for_subject(subject_id)
        
        args = note_parser.parse_args()
        note = Note(
            title=args.title,
            content=args.content,
            labels=get_valid_labels(args.label),
            subject=subject,
            user=g.user
        )

        db.session.add(note)
        db.session.commit()

        return note.to_dict(), 200


class NoteResource(Resource):
    @is_authenticated
    def get(self, subject_id: int, note_id: int):
        note = abort_for_note(subject_id, note_id)
        
        return note.to_dict()
    
    @is_authenticated
    def put(self, subject_id: int, note_id: int):
        args = note_parser.parse_args()
        
        note = abort_for_note(subject_id, note_id)
        note.title = args.title
        note.content = args.content
        note.labels = get_valid_labels(args.label)
        
        db.session.commit()
        return note.to_dict(), 201
    
    @is_authenticated
    def delete(self, subject_id: int, note_id: int):
        note = abort_for_note(subject_id, note_id)
        db.session.delete(note)
        db.session.commit()

        return {}, 204
