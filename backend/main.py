from flask import Flask, request, jsonify, session, send_from_directory
from config import app, db, socketio
from models import User, Personal_Data
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from flask_socketio import emit
import os

# --- SWIPE & SOCKET MEMORY ---
swipes = {}  # {'userA': ['userB']}
matches = set()  # {('userA', 'userB')}
connected_users = {}  # {'username': socket_id}

# --- KONFIGURACJA UPLOADÓW ---
app.config['UPLOAD_FOLDER_PROFILE'] = os.path.join(os.getcwd(), 'uploads')
app.config['UPLOAD_FOLDER_CARD'] = os.path.join(os.getcwd(), 'swipe_uploads')
os.makedirs(app.config['UPLOAD_FOLDER_PROFILE'], exist_ok=True)
os.makedirs(app.config['UPLOAD_FOLDER_CARD'], exist_ok=True)

# --- SWIPE API (MATCH + EMIT) ---
@app.route("/swipe_right", methods=["POST"])
def swipe_right():
    data = request.get_json()
    swiper = data.get("from")
    target = data.get("to")

    if not swiper or not target:
        return jsonify({"error": "Missing usernames"}), 400

    swipes.setdefault(swiper, []).append(target)

    if swiper in swipes.get(target, []):
        pair = tuple(sorted((swiper, target)))
        if pair not in matches:
            matches.add(pair)
            for user in pair:
                sid = connected_users.get(user)
                if sid:
                    socketio.emit("match-found", {
                        "with": target if user == swiper else swiper,
                        "message": "Chyba znalezlismy pare do twojego crocsa"
                    }, to=sid)
        return jsonify({"match": True})
    return jsonify({"match": False})

# --- SOCKETIO HANDLERS ---
@socketio.on("connect")
def on_connect():
    print("Socket connected")

@socketio.on("register")
def register_user(data):
    username = data.get("username")
    if username:
        connected_users[username] = request.sid
        print(f"{username} registered with SID {request.sid}")

@socketio.on("disconnect")
def on_disconnect():
    for user, sid in list(connected_users.items()):
        if sid == request.sid:
            print(f"{user} disconnected")
            del connected_users[user]
            break

# --- POZOSTAŁE ROUTES (bez zmian) ---
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
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    profile = Personal_Data.query.filter_by(user_id=user.id).first()
    if not profile:
        profile = Personal_Data(user_id=user.id)

    profile.first_name = data.get('first_name')
    profile.last_name = data.get('last_name')
    profile.location = data.get('location')
    profile.hobby = data.get('hobby')
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
    file.save(os.path.join(app.config['UPLOAD_FOLDER_PROFILE'], filename))

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
    file.save(os.path.join(app.config['UPLOAD_FOLDER_CARD'], filename))

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

    profiles = db.session.query(Personal_Data, User).join(User).filter(
        Personal_Data.last_name.ilike(f'%{query}%')
    ).all()

    results = [{
        "username": user.username,
        "profile_pic": personal.profile_pic
    } for personal, user in profiles]

    return jsonify({"profiles": results})

@app.route('/all_card_images')
def all_card_images():
    username = request.headers.get('username')
    current_user = User.query.filter_by(username=username).first()
    if not current_user:
        return jsonify({"photos": []})

    photos_query = Personal_Data.query.filter(
        Personal_Data.user_id != current_user.id,
        Personal_Data.card_image != None
    ).all()

    photos = [p.card_image for p in photos_query]
    return jsonify({"photos": photos})

# === Start app with SocketIO ===
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    socketio.run(app, debug=True)
