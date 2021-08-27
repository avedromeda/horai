from typing import List
from backend import db
from backend.authenticate import is_authenticated
from backend.models._helpers import abort_for_label
from backend.models.notes import Label
from flask import g
from flask_restful import Resource, reqparse

label_parser = reqparse.RequestParser()
label_parser.add_argument('name', type=str, required=True)
label_parser.add_argument('color', type=int, required=True)


class LabelList(Resource):
    @is_authenticated
    def get(self):
        return {
            "labels": [
                label.to_dict() for label in g.user.labels
            ]
        }

    @is_authenticated
    def post(self):
        args = label_parser.parse_args()
        label = Label(
            name=args.name,
            color=args.color,
            user=g.user
        )

        db.session.add(label)
        db.session.commit()

        return label.to_dict(), 200


class LabelResource(Resource):
    @is_authenticated
    def get(self, label_id: int):
        label = abort_for_label(label_id)
        
        return label.to_dict()
    
    @is_authenticated
    def put(self, label_id: int):
        args = label_parser.parse_args()
        
        label = abort_for_label(label_id)
        label.name = args.name
        label.color = args.color
        
        db.session.commit()
        
        return label.to_dict(), 201
    
    @is_authenticated
    def delete(self, label_id: int):
        label = abort_for_label(label_id)
        db.session.delete(label)
        db.session.commit()

        return {}, 204
