from flask import jsonify, request
from flask_restful import abort, Resource
from data import db_session
from data.users import User

def abort_if_user_not_found(user_id):
    session = db_session.create_session()
    user = session.query(User).get(user_id)
    if not user:
        abort(404, message=f"Пользователь {user_id} не найден")


class UserListResource(Resource):
    def get(self):
        session = db_session.create_session()
        users = session.query(User).order_by(User.is_activated).all()
        return jsonify([user.to_dict(only=('id', 'fio', 'email', 'is_activated')) for user in users])


class UserResource(Resource):
    def get(self, user_id):
        abort_if_user_not_found(user_id)
        session = db_session.create_session()
        user = session.query(User).filter_by(id=user_id).first()
        return jsonify(user.to_dict(only=('id', 'fio', 'email', 'is_activated', 'faculty', 'degree')))


    def put(self, user_id):
        abort_if_user_not_found(user_id)
        session = db_session.create_session()
        user = session.query(User).get(user_id)
        data = request.json
        if "is_activated" in data:
            user.is_activated = data["is_activated"]
        session.commit()
        return jsonify({'success': 'Пользователь обновлён'})


    def delete(self, user_id):
        abort_if_user_not_found(user_id)
        session = db_session.create_session()
        user = session.query(User).get(user_id)
        session.delete(user)
        session.commit()
        return jsonify({'success': 'Пользователь удалён'})
