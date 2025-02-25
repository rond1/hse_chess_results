import sqlalchemy
from flask_login import UserMixin
from sqlalchemy_serializer import SerializerMixin
from werkzeug.security import generate_password_hash, check_password_hash

from .db_session import SqlAlchemyBase

class User(SqlAlchemyBase, UserMixin, SerializerMixin):
    __tablename__ = 'users'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, autoincrement=True)

    is_admin = sqlalchemy.Column(sqlalchemy.Boolean, nullable=False, default=False)
    is_female = sqlalchemy.Column(sqlalchemy.Boolean, nullable=False, default=False)
    is_activated = sqlalchemy.Column(sqlalchemy.Boolean, nullable=False, default=False)

    fio = sqlalchemy.Column(sqlalchemy.String(255), nullable=False)
    email = sqlalchemy.Column(sqlalchemy.String(255), index=True, unique=True, nullable=False)
    hashed_password = sqlalchemy.Column(sqlalchemy.String(255), nullable=False)

    faculty = sqlalchemy.Column(sqlalchemy.String(50), nullable=False, default="")
    degree = sqlalchemy.Column(sqlalchemy.String(50), nullable=False, default="")

    def __repr__(self):
        return f"<User {self.id}: {self.fio}, {self.email}, {self.faculty}, {self.degree}>"

    def set_password(self, password):
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.hashed_password, password)

    def to_dict(self):
        return {
            "id": self.id,
            "fio": self.fio,
            "email": self.email,
            "faculty": self.faculty,
            "degree": self.degree,
            "is_admin": self.is_admin,
            "is_female": self.is_female,
            "is_activated": self.is_activated
        }
