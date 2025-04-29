from flask import jsonify, request
from flask_restful import abort, Resource

from data import db_session
from .__all_models import Category
from salt import salt

def abort_if_categories_not_found(category_id):
    session = db_session.create_session()
    category = session.query(Category).get(category_id)
    if not category:
        abort(404, message=f"Category {category_id} not found")


class CategoryListResource(Resource):
    def get(self):
        tournament_id = request.args.get('tournament_id', type=int)
        session = db_session.create_session()
        query = session.query(Category)
        if tournament_id:
            query = query.filter(Category.tournament_id == tournament_id)
        categories = query.all()
        return jsonify([
            category.to_dict(only=('id', 'name', 'tournament_id'))
            for category in categories
        ])


    def post(self):
        data = request.get_json(force=True)

        if data.get('salt') != salt:
            return jsonify({'error': 'unsalted'}), 400

        if not data.get('name'):
            return jsonify({'error': 'Invalid name'}), 400

        if 'name' in data and data['name'] and 'tournament_id' in data and data['tournament_id']:
            session = db_session.create_session()
            category = Category(
                name=data['name'],
                tournament_id=data['tournament_id']
            )
            session.add(category)
            session.commit()
            return jsonify({'success': 'OK'})

        return jsonify({'errors': 'Ошибка валидации'}), 400


class CategoryResource(Resource):
    def get(self, category_id):
        abort_if_categories_not_found(category_id)
        session = db_session.create_session()
        category = session.query(Category).get(category_id)
        return jsonify(category.to_dict(
            only=('name', 'tournament_id')
        ))

    def put(self, category_id):
        data = request.get_json(force=True)

        if data.get('salt') != salt:
            return jsonify({'error': 'unsalted'}), 400

        session = db_session.create_session()
        category = session.query(Category).get(category_id)
        if not category:
            abort(404, message=f"Category {category_id} not found")

        category.name = data.get('name')
        session.commit()

        return jsonify({'success': 'OK'})

    def delete(self, category_id):
        data = request.get_json(force=True)

        if data.get('salt') != salt:
            return jsonify({'error': 'unsalted'}), 400

        abort_if_categories_not_found(category_id)
        session = db_session.create_session()
        category = session.query(Category).get(category_id)
        session.delete(category)
        session.commit()
        return jsonify({'success': 'OK'})
