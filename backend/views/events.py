from backend.views.note import get_valid_labels
from datetime import datetime
from backend import db
from backend.authenticate import is_authenticated
from backend.models._helpers import abort_for_event
from backend.models.planner import Event
from flask import g
from flask_restful import Resource, reqparse

event_parser = reqparse.RequestParser()
event_parser.add_argument('title', type=str, required=True)
event_parser.add_argument('content', type=str, required=True)
event_parser.add_argument('color', type=int, required=True)
event_parser.add_argument('start_time', type=int, required=True)
event_parser.add_argument('end_time', type=int, required=True)
event_parser.add_argument('all_day', type=bool, required=True)
event_parser.add_argument('label', type=int, required=False, action="append")


class EventList(Resource):
    @is_authenticated
    def get(self):
        return {
            "events": [
                event.to_dict() for event in g.user.events
            ]
        }

    @is_authenticated
    def post(self):
        args = event_parser.parse_args()
        event = Event(
            title=args.title,
            content=args.content,
            color=args.color,
            start_time=datetime.fromtimestamp(args.start_time),
            end_time=datetime.fromtimestamp(args.end_time) if args.end_time else None,
            all_day=args.all_day,
            labels=get_valid_labels(args.label)
        )

        db.session.add(event)
        db.session.commit()

        return event.to_dict(), 200


class EventResource(Resource):
    @is_authenticated
    def get(self, event_id: int):
        event = abort_for_event(event_id)
        
        return event.to_dict()
    
    @is_authenticated
    def put(self, event_id: int):
        args = event_parser.parse_args()
        
        event = abort_for_event(event_id)
        event.name = args.name
        event.color = args.color
        
        db.session.commit()
        
        return event.to_dict(), 201
    
    @is_authenticated
    def delete(self, event_id: int):
        event = abort_for_event(event_id)
        db.session.delete(event)
        db.session.commit()

        return {}, 204
