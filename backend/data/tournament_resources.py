import datetime

from flask import request
from flask_restful import abort, Resource

from data import db_session
from .__all_models import Tournament
from salt import salt
from forms.tournament import TournamentPostForm
from extensions import cache

def abort_if_tournaments_not_found(tournament_id):
    session = db_session.create_session()
    tournament = session.query(Tournament).get(tournament_id)
    if not tournament:
        abort(404, message=f"Турнир {tournament_id} не найден")


class TournamentListResource(Resource):
    @staticmethod
    @cache.memoize(timeout=3600)
    def get_finished_tournaments():
        session = db_session.create_session()
        query = session.query(Tournament).filter(Tournament.is_finished == True)
        query = query.order_by(Tournament.start.desc())

        tournaments = query.all()
        return tournaments

    def get(self):
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        finished_tournaments = self.get_finished_tournaments()

        session = db_session.create_session()
        query = session.query(Tournament).filter(Tournament.is_finished == False)
        query = query.order_by(Tournament.start.desc())

        tournaments = query.offset((page - 1) * per_page).limit(per_page).all()
        total = query.count() + len(finished_tournaments)

        combined_tournaments = tournaments + finished_tournaments

        return {
            'tournaments': [
                tournament.to_dict(only=('id', 'name', 'game_time', 'move_time', 'start', 'is_finished', 'creator_id'))
                for tournament in combined_tournaments
            ],
            'total': total,
            'page': page,
            'pages': (total + per_page - 1) // per_page,
            'per_page': per_page
        }


    def post(self):
        data = request.get_json(force=True)

        if data.get('salt') != salt:
            return {'error': 'unsalted'}, 400

        form = TournamentPostForm(data=data)
        if form.validate():
            try:
                start = datetime.datetime.strptime(data['start'], '%Y-%m-%dT%H:%M')
            except (KeyError, ValueError):
                return {'error': 'Неверный формат даты'}, 400

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

            cache.delete_memoized(TournamentListResource.get_finished_tournaments)

            return {'success': 'OK'}

        try:
            start = datetime.datetime.strptime(data['start'], '%Y-%m-%dT%H:%M')
        except (KeyError, ValueError):
            return {'error': 'Неверный формат даты'}, 400

        tournament.name = data.get('name')
        tournament.game_time = data.get('game_time')
        tournament.move_time = data.get('move_time')
        tournament.start = start
        tournament.creator_id = data.get('creator_id')
        session.commit()

        cache.delete_memoized(TournamentListResource.get_finished_tournaments)

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

        cache.delete_memoized(TournamentListResource.get_finished_tournaments)

        return {'success': 'OK'}
