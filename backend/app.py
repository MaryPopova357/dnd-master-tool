from flask import Flask, request, jsonify, g
from flask_cors import CORS
from models import db, User, Campaign, Character
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import os
from datetime import datetime, timedelta
from functools import wraps
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)
db.init_app(app)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Токен отсутствует!'}), 401
        try:
            token = token.split(' ')[1]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'message': 'Пользователь не найден!'}), 401
            g.current_user = current_user
        except:
            return jsonify({'message': 'Неверный токен!'}), 401
        return f(*args, **kwargs)
    return decorated

@app.route('/auth/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email уже существует'}), 400
    
    hashed_password = generate_password_hash(data['password'])
    user = User(email=data['email'], name=data['name'], password_hash=hashed_password)
    db.session.add(user)
    db.session.commit()
    
    token = jwt.encode({'user_id': user.id, 'exp': datetime.utcnow() + timedelta(days=1)}, app.config['SECRET_KEY'])
    return jsonify({'token': token, 'user': {'id': user.id, 'email': user.email, 'name': user.name}}), 201

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'message': 'Неверный email или пароль'}), 401
    
    token = jwt.encode({'user_id': user.id, 'exp': datetime.utcnow() + timedelta(days=1)}, app.config['SECRET_KEY'])
    return jsonify({'token': token, 'user': {'id': user.id, 'email': user.email, 'name': user.name}})

@app.route('/auth/me', methods=['GET'])
@token_required
def get_me():
    return jsonify({'id': g.current_user.id, 'email': g.current_user.email, 'name': g.current_user.name})

@app.route('/campaigns', methods=['GET'])
@token_required
def get_campaigns():
    campaigns = Campaign.query.filter_by(user_id=g.current_user.id).all()
    return jsonify([{'id': c.id, 'title': c.title, 'created_at': c.created_at.isoformat()} for c in campaigns])

@app.route('/campaigns', methods=['POST'])
@token_required
def create_campaign():
    data = request.json
    campaign = Campaign(title=data['title'], user_id=g.current_user.id)
    db.session.add(campaign)
    db.session.commit()
    return jsonify({'id': campaign.id, 'title': campaign.title}), 201

@app.route('/campaigns/<int:id>', methods=['GET'])
@token_required
def get_campaign(id):
    campaign = Campaign.query.filter_by(id=id, user_id=g.current_user.id).first_or_404()
    return jsonify({'id': campaign.id, 'title': campaign.title, 'plot_notes': campaign.plot_notes or ""})

@app.route('/campaigns/<int:id>', methods=['PUT'])
@token_required
def update_campaign(id):
    campaign = Campaign.query.filter_by(id=id, user_id=g.current_user.id).first_or_404()
    data = request.json
    campaign.title = data.get('title', campaign.title)
    db.session.commit()
    return jsonify({'message': 'Обновлено'})

@app.route('/campaigns/<int:id>/notes', methods=['POST'])
@token_required
def save_notes(id):
    campaign = Campaign.query.filter_by(id=id, user_id=g.current_user.id).first_or_404()
    data = request.json
    campaign.plot_notes = data.get('notes', '')
    db.session.commit()
    return jsonify({'message': 'Сохранено'})

@app.route('/campaigns/<int:id>', methods=['DELETE'])
@token_required
def delete_campaign(id):
    campaign = Campaign.query.filter_by(id=id, user_id=g.current_user.id).first_or_404()
    db.session.delete(campaign)
    db.session.commit()
    return jsonify({'message': 'Удалено'})

@app.route('/campaigns/<int:campaign_id>/characters', methods=['GET'])
@token_required
def get_characters(campaign_id):
    characters = Character.query.filter_by(campaign_id=campaign_id).all()
    return jsonify([{'id': c.id, 'name': c.name, 'race': c.race, 'class_name': c.class_name, 'level': c.level} for c in characters])

@app.route('/campaigns/<int:campaign_id>/characters', methods=['POST'])
@token_required
def create_character(campaign_id):
    campaign = Campaign.query.filter_by(id=campaign_id, user_id=g.current_user.id).first_or_404()
    data = request.json
    character = Character(
        name=data['name'], race=data['race'], class_name=data['class_name'], level=data.get('level', 1),
        strength=data.get('strength', 10), dexterity=data.get('dexterity', 10), constitution=data.get('constitution', 10),
        intelligence=data.get('intelligence', 10), wisdom=data.get('wisdom', 10), charisma=data.get('charisma', 10),
        current_hp=data.get('current_hp', 10), max_hp=data.get('max_hp', 10), armor_class=data.get('armor_class', 10),
        speed=data.get('speed', 30), weapon=data.get('weapon', ''), campaign_id=campaign_id
    )
    db.session.add(character)
    db.session.commit()
    return jsonify({'id': character.id}), 201

@app.route('/characters/<int:id>', methods=['GET'])
@token_required
def get_character(id):
    character = Character.query.get_or_404(id)
    campaign = Campaign.query.filter_by(id=character.campaign_id, user_id=g.current_user.id).first_or_404()
    return jsonify({
        'id': character.id, 'name': character.name, 'race': character.race, 'class_name': character.class_name,
        'level': character.level, 'strength': character.strength, 'dexterity': character.dexterity,
        'constitution': character.constitution, 'intelligence': character.intelligence, 'wisdom': character.wisdom,
        'charisma': character.charisma, 'current_hp': character.current_hp, 'max_hp': character.max_hp,
        'armor_class': character.armor_class, 'speed': character.speed, 'weapon': character.weapon
    })

@app.route('/characters/<int:id>', methods=['PUT'])
@token_required
def update_character(id):
    character = Character.query.get_or_404(id)
    campaign = Campaign.query.filter_by(id=character.campaign_id, user_id=g.current_user.id).first_or_404()
    data = request.json
    for key, value in data.items():
        if hasattr(character, key):
            setattr(character, key, value)
    db.session.commit()
    return jsonify({'message': 'Обновлено'})

@app.route('/characters/<int:id>', methods=['DELETE'])
@token_required
def delete_character(id):
    character = Character.query.get_or_404(id)
    campaign = Campaign.query.filter_by(id=character.campaign_id, user_id=g.current_user.id).first_or_404()
    db.session.delete(character)
    db.session.commit()
    return jsonify({'message': 'Удалено'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)
