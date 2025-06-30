from flask import Flask, request, jsonify, session, send_from_directory
from config import app, db
from models import User, Personal_Data
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os


# --- KONFIGURACJA UPLOADÓW ---

app.config['UPLOAD_FOLDER_PROFILE'] = os.path.join(os.getcwd(), 'uploads')  # dla zdjęć profilowych
app.config['UPLOAD_FOLDER_CARD'] = os.path.join(os.getcwd(), 'swipe_uploads')  # dla zdjęć card/swipe

os.makedirs(app.config['UPLOAD_FOLDER_PROFILE'], exist_ok=True)
os.makedirs(app.config['UPLOAD_FOLDER_CARD'], exist_ok=True)


# --- ROUTES ---

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()

    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    default_pic = 'Nowy_projekt_5.png'

    if User.query.filter_by(username=username).first():
        return jsonify({"Message": "User already exist"}), 400

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    new_user = User(username=username, password=hashed_password, email=email)

    db.session.add(new_user)
    db.session.commit()

    user_profile = Personal_Data(user_id=new_user.id, profile_pic=default_pic)
    db.session.add(user_profile)
    db.session.commit()

    return jsonify({"message": "User successfully registered"}), 201


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if user is None or not check_password_hash(user.password, password):
        return jsonify({"Message": "Invalid data or user not created"}), 401

    return jsonify({"message": "Successfully logged in"}), 200


@app.route("/api/logout", methods=["POST"])
def logout():
    session.pop('id', None)
    return jsonify({"message": "Successfully logged out"}), 200


@app.route('/homepage/<username>', methods=["GET"])
def homepage(username):
    # Pobieramy username z parametru URL, a nie z headera
    user = User.query.filter_by(username=username).first()

    if user:
        data = user.personal_data
        profile_data = {
            'first_name': data.first_name if data else None,
            'last_name': data.last_name if data else None,
            'location': data.location if data else None,
            'hobby': data.hobby if data else None,
            'profile_pic': data.profile_pic if data else None,
            'card_image': data.card_image if data else None
        }
        return jsonify({'message': f'Welcome, {username}!', 'profile': profile_data}), 200
    return jsonify({'message': 'Unauthorized'}), 401


@app.route('/profile/<username>', methods=['POST'])
def update_profile(username):
    data = request.get_json()
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    location = data.get('location')
    hobby = data.get('hobby')

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    profile = Personal_Data.query.filter_by(user_id=user.id).first()
    if not profile:
        profile = Personal_Data(user_id=user.id)

    profile.first_name = first_name
    profile.last_name = last_name
    profile.location = location
    profile.hobby = hobby
    db.session.add(profile)
    db.session.commit()
    return jsonify({'message': 'Profile updated successfully'}), 200


@app.route('/upload/<username>', methods=["POST"])
def upload_pic(username):
    if 'file' not in request.files:
        return jsonify({'message': "No selected file"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'message': "No selected file"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER_PROFILE'], filename)
    file.save(file_path)

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'message': 'User not found'}), 400

    profile = Personal_Data.query.filter_by(user_id=user.id).first()
    if not profile:
        profile = Personal_Data(user_id=user.id)

    profile.profile_pic = filename
    db.session.add(profile)
    db.session.commit()

    return jsonify({"message": "Picture successfully added", "profile_pic": filename}), 200


@app.route('/upload_card_image/<username>', methods=["POST"])
def upload_card_image(username):
    if 'file' not in request.files:
        return jsonify({'message': "No selected file"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'message': "No selected file"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER_CARD'], filename)
    file.save(file_path)

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'message': 'User not found'}), 400

    profile = Personal_Data.query.filter_by(user_id=user.id).first()
    if not profile:
        profile = Personal_Data(user_id=user.id)

    profile.card_image = filename
    db.session.add(profile)
    db.session.commit()

    return jsonify({"message": "Card image successfully added", "card_image": filename}), 200


@app.route('/uploads/<filename>')
def uploaded_profile_pic(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER_PROFILE'], filename)


@app.route('/swipe_uploads/<filename>')
def uploaded_card_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER_CARD'], filename)


@app.route('/search_profiles', methods=['GET'])
def search_profile():
    query = request.args.get('q')

    if not query:
        return jsonify({"profiles": []})

    profiles = db.session.query(Personal_Data, User).join(User, Personal_Data.user_id == User.id).filter(
        Personal_Data.last_name.ilike(f'%{query}%')).all()

    results = []
    for personal, user in profiles:
        results.append({
            "username": user.username,
            "profile_pic": personal.profile_pic
        })

    print(f"Results sent: {results}")
    return jsonify({"profiles": results})


if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(debug=True)
