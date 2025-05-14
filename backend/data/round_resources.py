import datetime

from sqlalchemy.exc import SQLAlchemyError
from flask import request
from flask_restful import abort, Resource

from data import db_session
from data.__all_models import Round
from salt import salt


def abort_if_round_not_found(round_id):
    session = db_session.create_session()
    round = session.query(Round).get(round_id)
    if not round:
        abort(404, message=f"Тур {round_id} не найден")


class RoundListResource(Resource):
    def get(self):
        category_id = request.args.get('category_id', type=int)
        session = db_session.create_session()
        query = session.query(Round)
        if category_id:
            query = query.filter(Round.category_id == category_id)
        rounds = query.all()
        return [
            round.to_dict(only=('id', 'name', 'category_id', 'date'))
            for round in rounds
        ]


    def post(self):
        data = request.get_json(force=True)

        if data.get('salt') != salt:
            return {'error': 'unsalted'}, 400

        if not data.get('name') or not data.get('category_id') or not data.get('date'):
            return {'error': 'Недопустимые данные'}, 400

        try:
            date = datetime.datetime.strptime(data['date'], '%Y-%m-%dT%H:%M')
        except (KeyError, ValueError):
            return {'error': 'Неверный формат даты'}, 400

        session = db_session.create_session()
        round = Round(
            name=data['name'],
            category_id=data['category_id'],
            date=date
        )
        session.add(round)
        session.commit()
        return {'success': 'OK'}


class RoundResource(Resource):
    def get(self, round_id):
        abort_if_round_not_found(round_id)
        session = db_session.create_session()
        round = session.query(Round).get(round_id)
        return round.to_dict(only=('id', 'name', 'category_id', 'date', 'creator_id'))


    def put(self, round_id):
        abort_if_round_not_found(round_id)
        data = request.get_json(force=True)

        if data.get('salt') != salt:
            return {'error': 'unsalted'}, 400

        session = db_session.create_session()
        round = session.query(Round).get(round_id)

        try:
            date = datetime.datetime.strptime(data['date'], '%Y-%m-%dT%H:%M')
        except (KeyError, ValueError):
            return {'error': 'Неверный формат даты'}, 400

        round.name = data.get('name')
        round.date = date
        session.commit()

        return {'success': 'OK'}


    def delete(self, round_id):
        abort_if_round_not_found(round_id)
        session = db_session.create_session()
        round = session.query(Round).get(round_id)
        session.delete(round)
        try:
            session.commit()
        except SQLAlchemyError as e:
            session.rollback()
            return {'error': str(e)}, 500
        return {'success': 'OK'}
