import io
import chess.pgn

from flask import request
from flask_restful import Resource

from sqlalchemy.exc import SQLAlchemyError
from data import db_session
from data.games import Game
from salt import salt


class PGNUploadResource(Resource):
    def post(self):
        if 'file' not in request.files:
            return {'error': 'Файл не найден'}, 400
        if request.form.get('salt') != salt:
            return {'error': 'unsalted'}, 400
        round_id = request.form.get('round_id', type=int)
        if not round_id:
            return {'error': 'Не указан round_id'}, 400

        file = request.files['file']
        pgn_text = file.read().decode('utf-8')
        print("PGN (начало):", pgn_text[:500])
        pgn_io = io.StringIO(pgn_text)

        session = db_session.create_session()

        board_number = 1
        while True:
            try:
                game = chess.pgn.read_game(pgn_io)
            except Exception as e:
                print("Ошибка парсинга PGN:", str(e))
                return {'error': 'Некорректный формат PGN'}, 400

            if game is None:
                break

            white = game.headers["White"]
            black = game.headers["Black"]
            result = game.headers["Result"]

            moves_san = []
            node = game
            while node.variations:
                next_node = node.variations[0]
                moves_san.append(node.board().san(next_node.move))
                node = next_node
            moves_str = ' '.join(moves_san)

            existing = session.query(Game).filter_by(round_id=round_id, board=board_number).first()
            while existing:
                board_number += 1
                existing = session.query(Game).filter_by(round_id=round_id, board=board_number).first()

            db_game = Game(
                round_id=round_id,
                board=board_number,
                white_player=white,
                black_player=black,
                result=result,
                moves=moves_str
            )
            session.add(db_game)
            board_number += 1

        try:
            session.commit()
        except SQLAlchemyError as e:
            session.rollback()
            return {'error': str(e)}, 500

        return {'success': f'Загружено партий: {board_number - 1}'}
