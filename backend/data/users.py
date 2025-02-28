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

    def to_dict(self, only=None):
        # facs = {
        #     "cs": "Факультет компьютерных наук",
        #     "math": "Факультет математики",
        #     "soc": "Факультет социальных наук",
        #     "wep": "Факультет мировой экономики и мировой политики",
        #     "ci": "Факультет креативных индустрий",
        #     "geo": "Факультет географии и геоинформационных технологий",
        #     "hum": "Факультет гуманитарных наук",
        #     "law": "Факультет права",
        #     "bm": "Факультет бизнеса и менеджмента",
        #     "cmd": "Факультет коммуникаций, медиа и дизайна",
        #     "edu": "Институт образования",
        #     "trans": "Институт экономики транспорта и транспортной политики",
        #     "stat": "Институт статистических исследований и экономики знаний",
        #     "demo": "Институт демографии",
        #     "law_dev": "Институт права и развития",
        #     "miem": "Московский институт электроники и математики (МИЭМ)"
        # }
        #
        # degree = {
        #     "1": "1 курс бакалавриата",
        #     "2": "2 курс бакалавриата",
        #     "3": "3 курс бакалавриата",
        #     "4": "4 курс бакалавриата",
        #     "5": "1 курс специалитета",
        #     "6": "2 курс специалитета",
        #     "7": "3 курс специалитета",
        #     "8": "4 курс специалитета",
        #     "9": "5 курс специалитета",
        #     "10": "1 курс магистратуры",
        #     "11": "2 курс магистратуры",
        #     "12": "1 курс аспирантуры",
        #     "13": "2 курс аспирантуры",
        #     "14": "3 курс аспирантуры",
        #     "15": "Выпускник"
        # }
        data = {
            "id": self.id,
            "fio": self.fio,
            "email": self.email,
            "faculty": self.faculty,
            "degree": self.degree,
            "is_admin": self.is_admin,
            "is_female": self.is_female,
            "is_activated": self.is_activated
        }
        return {key: data[key] for key in only} if only else data
