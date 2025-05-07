import sqlalchemy
from sqlalchemy import orm
from sqlalchemy_serializer import SerializerMixin

from .db_session import SqlAlchemyBase


class Round(SqlAlchemyBase, SerializerMixin):
    __tablename__ = 'rounds'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, autoincrement=True)
    category_id = sqlalchemy.Column(sqlalchemy.Integer, sqlalchemy.ForeignKey("categories.id"))
    name = sqlalchemy.Column(sqlalchemy.String(255), nullable=False)
    date = sqlalchemy.Column(sqlalchemy.DateTime, nullable=False)
    category = orm.relationship('Category', back_populates='rounds')


    def to_dict(self, only=None):
        data = {
            "id": self.id,
            "name": self.name,
            "category_id": self.category_id,
            "date": self.date.strftime('%Y-%m-%dT%H:%M'),
            "creator_id": self.category.tournament.creator_id
        }
        return {key: data[key] for key in only} if only else data