from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(80), nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    campaigns = db.relationship('Campaign', backref='user', lazy=True, cascade='all, delete-orphan')

class Campaign(db.Model):
    __tablename__ = 'campaigns'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    plot_notes = db.Column(db.Text, default="")
    characters = db.relationship('Character', backref='campaign', lazy=True, cascade='all, delete-orphan')

class Character(db.Model):
    __tablename__ = 'characters'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    race = db.Column(db.String(50), nullable=False)
    class_name = db.Column(db.String(50), nullable=False)
    level = db.Column(db.Integer, default=1)
    strength = db.Column(db.Integer, default=10)
    dexterity = db.Column(db.Integer, default=10)
    constitution = db.Column(db.Integer, default=10)
    intelligence = db.Column(db.Integer, default=10)
    wisdom = db.Column(db.Integer, default=10)
    charisma = db.Column(db.Integer, default=10)
    current_hp = db.Column(db.Integer, default=10)
    max_hp = db.Column(db.Integer, default=10)
    armor_class = db.Column(db.Integer, default=10)
    speed = db.Column(db.Integer, default=30)
    weapon = db.Column(db.String(100), default="")
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False)
