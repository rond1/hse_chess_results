import datetime

from flask import request
from flask_restful import abort, Resource

from data import db_session
from .__all_models import Tournament
from salt import salt
from forms.tournament import TournamentPostForm

def abort_if_tournaments_not_found(tournament_id):
    session = db_session.create_session()
    tournament = session.query(Tournament).get(tournament_id)
    if not tournament:
        abort(404, message=f"Tournament {tournament_id} not found")


class TournamentListResource(Resource):
    def get(self):
        session = db_session.create_session()
        tournaments = session.query(Tournament).order_by(Tournament.is_finished, Tournament.start.desc()).all()
        return [
            tournament.to_dict(only=('id', 'name', 'game_time', 'move_time', 'start', 'is_finished', 'creator_id'))
            for tournament in tournaments
        ]


    def post(self):
        data = request.get_json(force=True)

        if data.get('salt') != salt:
            return {'error': 'unsalted'}, 400

        form = TournamentPostForm(data=data)
        if form.validate():
            try:
                start = datetime.datetime.strptime(data['start'], '%Y-%m-%dT%H:%M')
            except (KeyError, ValueError):
                return {'error': 'Invalid datetime format'}, 400

            session = db_session.create_session()
            tournament = Tournament(
                name=data['name'],
                game_time=data['game_time'],
                move_time=data['move_time'],
                start=start,
                creator_id=data['creator_id']
            )
            session.add(tournament)
            session.commit()
            return {'success': 'OK'}

        return {'errors': form.errors}, 400


class TournamentResource(Resource):
    def get(self, tournament_id):
        abort_if_tournaments_not_found(tournament_id)
        session = db_session.create_session()
        tournament = session.query(Tournament).get(tournament_id)
        return tournament.to_dict(
            only=('name', 'game_time', 'move_time', 'start', 'is_finished', 'creator_id')
        )


    def put(self, tournament_id):
        abort_if_tournaments_not_found(tournament_id)
        data = request.get_json(force=True)

        if data.get('salt') != salt:
            return {'error': 'unsalted'}, 400

        session = db_session.create_session()
        tournament = session.query(Tournament).get(tournament_id)

        if 'is_finished' in data and len(data.keys()) <= 3:
            tournament.is_finished = data['is_finished']
            session.commit()
            return {'success': 'OK'}

        try:
            start = datetime.datetime.strptime(data['start'], '%Y-%m-%dT%H:%M')
        except (KeyError, ValueError):
            return {'error': 'Invalid datetime format'}, 400

        tournament.name = data.get('name')
        tournament.game_time = data.get('game_time')
        tournament.move_time = data.get('move_time')
        tournament.start = start
        tournament.creator_id = data.get('creator_id')
        session.commit()

        return {'success': 'OK'}


    def delete(self, tournament_id):
        data = request.get_json(force=True)

        if data.get('salt') != salt:
            return {'error': 'unsalted'}, 400

        abort_if_tournaments_not_found(tournament_id)
        session = db_session.create_session()
        tournament = session.query(Tournament).get(tournament_id)
        session.delete(tournament)
        session.commit()
        return {'success': 'OK'}
