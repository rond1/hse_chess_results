import sqlalchemy
from sqlalchemy import orm
from sqlalchemy_serializer import SerializerMixin

from .db_session import SqlAlchemyBase


class Category(SqlAlchemyBase, SerializerMixin):
    __tablename__ = 'categories'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, autoincrement=True)
    tournament_id = sqlalchemy.Column(sqlalchemy.Integer, sqlalchemy.ForeignKey("tournaments.id"))
    name = sqlalchemy.Column(sqlalchemy.String(255), nullable=False)
    tournament = orm.relationship('Tournament', back_populates='categories')


    def to_dict(self, only=None):
        data = {
            "id": self.id,
            "name": self.name,
            "tournament_id": self.tournament_id,
            "creator_id": self.tournament.to_dict(only=["creator_id"])["creator_id"]
        }
        return {key: data[key] for key in only} if only else data