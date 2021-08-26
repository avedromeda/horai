from flask_restful import Resource, abort, reqparse
from backend import db
from backend.authenticate import is_authenticated
from backend.models.notes import Subject
from flask import g


subject_parser = reqparse.RequestParser()
subject_parser.add_argument('name', type=str, required=True)

class SubjectList(Resource):
    @is_authenticated
    def get(self):
        return {
            "subjects": [
                subject.to_dict() for subject in g.user.subjects
            ]
        }

    @is_authenticated
    def post(self):
        args = subject_parser.parse_args()
        subject = Subject(
            name=args.name,
            user_id=g.user.id
        )

        db.session.add(subject)
        db.session.commit()

        return subject.to_dict(), 200


def abort_for_subject(subject_id: int):
    subject = Subject.query.get(subject_id)
    if subject:
        # Ensure owner
        if subject.user == g.user or g.user.admin_features:
            return subject
        
        abort(403, message=f"This is not your subject")
    
    abort(404, message=f"Subject {subject_id} does not exist.")


class SubjectResource(Resource):
    @is_authenticated
    def get(self, subject_id: int):
        subject = abort_for_subject(subject_id)
        
        return subject.to_dict()
    
    @is_authenticated
    def put(self, subject_id: int):
        args = subject_parser.parse_args()
        
        subject = abort_for_subject(subject_id)
        subject.name = args.name
        db.session.commit()

        return subject.to_dict(), 201
    
    @is_authenticated
    def delete(self, subject_id: int):
        subject = abort_for_subject(subject_id)
        db.session.delete(subject)
        db.session.commit()

        return {}, 204