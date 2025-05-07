import sqlalchemy as sa
import sqlalchemy.orm as orm
from sqlalchemy.orm import Session, scoped_session
import sqlalchemy.ext.declarative as dec

SqlAlchemyBase = dec.declarative_base()

__factory = None
scoped_session_factory = None


def global_init(username, password, host, port, db_name):
    global __factory, scoped_session_factory

    if __factory:
        return

    if not all([username, password, host, port, db_name]):
        raise Exception("Необходимо указать все параметры подключения к базе данных.")

    conn_str = f"mysql+pymysql://{username}:{password}@{host}/{db_name}"
    engine = sa.create_engine(conn_str, echo=False, connect_args={'charset': 'utf8mb4'})

    __factory = orm.sessionmaker(bind=engine)
    scoped_session_factory = scoped_session(__factory)

    from . import __all_models  # Подключаем все модели

    SqlAlchemyBase.metadata.create_all(engine)


def create_session() -> Session:
    global scoped_session_factory
    return scoped_session_factory()