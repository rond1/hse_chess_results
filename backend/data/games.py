import sqlalchemy
from sqlalchemy import orm
from sqlalchemy_serializer import SerializerMixin

from .db_session import SqlAlchemyBase


class Game(SqlAlchemyBase, SerializerMixin):
    __tablename__ = 'games'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, autoincrement=True)
    round_id = sqlalchemy.Column(sqlalchemy.Integer, sqlalchemy.ForeignKey("rounds.id"), nullable=False)
    board = sqlalchemy.Column(sqlalchemy.Integer, nullable=False)
    white_player = sqlalchemy.Column(sqlalchemy.String(255), nullable=False)
    black_player = sqlalchemy.Column(sqlalchemy.String(255), nullable=False)
    result = sqlalchemy.Column(sqlalchemy.String(8), nullable=True)
    moves = sqlalchemy.Column(sqlalchemy.Text(300), nullable=True)

    round = orm.relationship('Round', back_populates='games')
    __table_args__ = (
        sqlalchemy.UniqueConstraint('round_id', 'board', name='unique_board_per_round'),
    )

    def to_dict(self, only=None):
        data = {
            "id": self.id,
            "board": self.board,
            "white_player": self.white_player,
            "black_player": self.black_player,
            "result": self.result,
            "round_id": self.round_id,
            "moves": self.moves
        }
        return {key: data[key] for key in only} if only else data