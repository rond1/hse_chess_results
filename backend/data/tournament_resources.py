import datetime

from flask import jsonify
from flask_restful import abort, Resource, reqparse

from data import db_session
from .__all_models import Tournament
from salt import salt


def abort_if_tournaments_not_found(tournament_id):
    session = db_session.create_session()
    tournament = session.query(Tournament).get(tournament_id)
    if not tournament:
        abort(404, message=f"Tournament {tournament_id} not found")


parser = reqparse.RequestParser()
parser.add_argument('name', required=True)
parser.add_argument('start', required=True)
parser.add_argument('game_time', required=True, type=int)
parser.add_argument('move_time', required=True, type=int)
parser.add_argument('salt', required=True)


class TournamentListResource(Resource):
    def get(self):
        session = db_session.create_session()
        tournaments = session.query(Tournament).order_by(Tournament.is_finished, Tournament.start.desc()).all()
        tournaments1 = []
        for tournament in tournaments:
            tournament1 = tournament.to_dict(
                only=('id', 'name', 'game_time', 'move_time', 'start', 'is_finished'))
            tournaments1.append(tournament1)

        return jsonify(tournaments1)

    def post(self):
        args = parser.parse_args()
        print(args)
        if args['salt'] != salt:
            return jsonify({'error': 'unsalted'})
        session = db_session.create_session()
        tournament = Tournament(
            name=args['name'],
            game_time=int(args['game_time']),
            move_time=int(args['move_time']),
            start=datetime.datetime.strptime(args['start'], '%Y-%m-%d %H:%M')
        )
        session.add(tournament)
        session.commit()
        return jsonify({'success': 'OK'})


parser2 = reqparse.RequestParser()
parser2.add_argument('user_id', type=int)
parser2.add_argument('salt', required=True)

parser1 = reqparse.RequestParser()
parser1.add_argument('name', required=True)
parser1.add_argument('start', required=True)
parser1.add_argument('game_time', required=True, type=int)
parser1.add_argument('move_time', required=True, type=int)

parser3 = reqparse.RequestParser()
parser3.add_argument('salt', required=True)
parser3.add_argument('user_id', required=True, type=int)


class TournamentResource(Resource):
    def get(self, tournament_id):
        abort_if_tournaments_not_found(tournament_id)
        session = db_session.create_session()
        tournament = session.query(Tournament).get(tournament_id)
        tournament1 = tournament.to_dict(
            only=('name', 'game_time', 'move_time', 'start', 'is_finished'))
        # categories = []
        # for category in tournament.categories:
        #     category1 = category.to_dict(
        #         only=('id', 'name', 'gender', 'is_finished'))
        #     category1['groups'] = []
        #     for group in category.groups:
        #         category1['groups'].append(group.to_dict(
        #             only=('id', 'name')))
        #     categories.append(category1)
        # tournament1['categories'] = categories
        return jsonify(tournament1)

    def put(self, tournament_id):
        args = parser2.parse_args()
        if args['salt'] != salt:
            return jsonify({'error': 'unsalted'})
        session = db_session.create_session()
        tournament = session.query(Tournament).get(tournament_id)
        args = parser1.parse_args()
        tournament.name = args['name']
        tournament.game_time = args['game_time']
        tournament.move_time = args['move_time']
        tournament.start = datetime.datetime.strptime(args['start'], '%Y-%m-%dT%H:%M')
        session.commit()
        return jsonify({'success': 'OK'})

    def delete(self, tournament_id):
        args = parser3.parse_args()
        if args['salt'] != salt:
            return jsonify({'error': 'unsalted'})
        abort_if_tournaments_not_found(tournament_id)
        session = db_session.create_session()
        tournament = session.query(Tournament).get(tournament_id)
        session.delete(tournament)
        session.commit()
        return jsonify({'success': 'OK'})