from datetime import datetime

import sqlalchemy
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

from .db_session import SqlAlchemyBase


class Tournament(SqlAlchemyBase, SerializerMixin):
    __tablename__ = 'tournaments'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, autoincrement=True)
    name = sqlalchemy.Column(sqlalchemy.String(255), nullable=False)

    game_time = sqlalchemy.Column(sqlalchemy.Integer, nullable=False)
    move_time = sqlalchemy.Column(sqlalchemy.Integer, nullable=True, default=0)

    start = sqlalchemy.Column(sqlalchemy.DateTime, nullable=False)
    is_finished = sqlalchemy.Column(sqlalchemy.Boolean, nullable=False, default=False)

    creator_id = sqlalchemy.Column(sqlalchemy.Integer,
                                   ForeignKey('users.id'),
                                   nullable=False)
    creator = relationship('User', backref='tournaments')


    def to_dict(self, only=None):
        data = {
            "id": self.id,
            "name": self.name,
            "game_time": self.game_time,
            "move_time": self.move_time,
            "start": self.start.strftime('%Y-%m-%d %H:%M'),
            "is_finished": ''
        }
        if datetime.now() < self.start:
            data["is_finished"] = 'Турнир ещё не начался'
        return {key: data[key] for key in only} if only else data
