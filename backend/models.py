from config import db

class User(db.Model):
    id = db.Column(db.INTEGER, primary_key = True)
    username = db.Column(db.String(80) , unique=True , nullable=False)
    password = db.Column(db.String(80) ,nullable=False)
    email = db.Column(db.String(80) , nullable=False)

    personal_data = db.relationship('Personal_Data' , back_populates='user' , uselist=False)


class Swipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    swiper_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    target_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class Match(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user1_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user2_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)


class Personal_Data(db.Model):
    id = db.Column(db.INTEGER, primary_key = True)
    first_name = db.Column(db.String(80) , nullable=True)
    last_name = db.Column(db.String(80), nullable=True)
    location = db.Column(db.String(120), nullable=True)
    hobby = db.Column(db.String(300) , nullable=True)
    profile_pic = db.Column(db.String(120) , nullable=True ,default='Nowy_projekt_5.png')
    card_image = db.Column(db.String(120), nullable=True)

    user_id = db.Column(db.INTEGER, db.ForeignKey('user.id'), unique=True)
    user = db.relationship('User' , back_populates='personal_data')