from sqlalchemy.exc import SQLAlchemyError
from flask import jsonify, request
from flask_restful import abort, Resource

from data import db_session
from data.games import Game
from salt import salt


def abort_if_game_not_found(game_id):
    session = db_session.create_session()
    game = session.query(Game).get(game_id)
    if not game:
        abort(404, message=f"Game {game_id} not found")


class GameListResource(Resource):
    def get(self):
        round_id = request.args.get('round_id', type=int)
        session = db_session.create_session()
        query = session.query(Game)
        if round_id:
            query = query.filter(Game.round_id == round_id).order_by(Game.board)
        games = query.all()
        return jsonify([
            game.to_dict(only=(
                'id', 'board', 'white_player', 'black_player', 'result', 'round_id'
            )) for game in games
        ])

    def post(self):
        data = request.get_json(force=True)

        if data.get('salt') != salt:
            return jsonify({'error': 'unsalted'}), 400

        required_fields = ['round_id', 'board', 'white_player', 'black_player']
        if not all(data.get(field) for field in required_fields):
            return jsonify({'error': 'Пропущены обязательные поля'}), 400

        session = db_session.create_session()
        existing_game = session.query(Game).filter_by(round_id=data['round_id'], board=data['board']).first()
        if existing_game:
            return jsonify({"error": "Доска с таким номером уже существует в этом туре"}), 400

        game = Game(
            round_id=data['round_id'],
            board=data['board'],
            white_player=data['white_player'],
            black_player=data['black_player'],
            result=data.get('result')
        )
        session.add(game)
        try:
            session.commit()
        except SQLAlchemyError as e:
            session.rollback()
            return jsonify({'error': str(e)}), 500
        return jsonify({'success': 'OK'})


class GameResource(Resource):
    def get(self, game_id):
        abort_if_game_not_found(game_id)
        session = db_session.create_session()
        game = session.query(Game).get(game_id)
        return jsonify(game.to_dict(only=(
            'id', 'board', 'white_player', 'black_player', 'result', 'round_id'
        )))

    def put(self, game_id):
        abort_if_game_not_found(game_id)
        data = request.get_json(force=True)

        if data.get('salt') != salt:
            return jsonify({'error': 'unsalted'}), 400

        session = db_session.create_session()
        game = session.query(Game).get(game_id)
        if data['board'] != game.board:
            existing_game = session.query(Game).filter_by(round_id=game.round_id, board=data['board']).first()
            if existing_game and existing_game.id != game_id:
                return jsonify({"error": "Доска с таким номером уже существует в этом туре"}), 400

        for field in ['board', 'white_player', 'black_player', 'result']:
            if field in data:
                setattr(game, field, data[field])

        try:
            session.commit()
        except SQLAlchemyError as e:
            session.rollback()
            return jsonify({'error': str(e)}), 500
        return jsonify({'success': 'OK'})

    def delete(self, game_id):
        abort_if_game_not_found(game_id)
        session = db_session.create_session()
        game = session.query(Game).get(game_id)
        session.delete(game)
        try:
            session.commit()
        except SQLAlchemyError as e:
            session.rollback()
            return jsonify({'error': str(e)}), 500
        return jsonify({'success': 'OK'})
