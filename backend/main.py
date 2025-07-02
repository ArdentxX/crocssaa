from flask import request, jsonify, session, send_from_directory
from config import app, db, socketio
from flask_socketio import emit
from models import User, Personal_Data, Swipe, Match, Message
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os

# ===== SWIPE SYSTEM & SOCKET =====
connected_users = {}

@socketio.on("connect")
def on_connect():
    print("Użytkownik połączony przez socket")

@socketio.on("register")
def handle_register(data):
    username = data.get("username")
    if username:
        connected_users[username] = request.sid
        print(f"{username} połączony z SID {request.sid}")

@socketio.on("disconnect")
def handle_disconnect():
    for user, sid in list(connected_users.items()):
        if sid == request.sid:
            del connected_users[user]
            print(f"{user} rozłączony")
            break

@socketio.on("send-message")
def handle_send_message(data):
    sender_name = data.get("from")
    receiver_name = data.get("to")
    content = data.get("message")

    sender = User.query.filter_by(username=sender_name).first()
    receiver = User.query.filter_by(username=receiver_name).first()

    if not sender or not receiver or not content:
        return

    msg = Message(sender_id=sender.id, receiver_id=receiver.id, content=content)
    db.session.add(msg)
    db.session.commit()

    sid = connected_users.get(receiver_name)
    if sid:
        emit("receive-message", {"from": sender_name, "message": content}, to=sid)

@app.route("/swipe_right", methods=["POST"])
def swipe_right():
    data = request.get_json()
    swiper_name = data.get("from")
    target_name = data.get("to")

    if not swiper_name or not target_name:
        return jsonify({"error": "Missing usernames"}), 400

    swiper = User.query.filter_by(username=swiper_name).first()
    target = User.query.filter_by(username=target_name).first()
    if not swiper or not target:
        return jsonify({"error": "User not found"}), 404

    # Zapisz swipe tylko jeśli jeszcze go nie ma
    existing_swipe = Swipe.query.filter_by(swiper_id=swiper.id, target_id=target.id).first()
    if not existing_swipe:
        new_swipe = Swipe(swiper_id=swiper.id, target_id=target.id)
        db.session.add(new_swipe)
        db.session.commit()

    # Sprawdź, czy druga osoba też zrobiła swipe na tego użytkownika
    reverse_swipe = Swipe.query.filter_by(swiper_id=target.id, target_id=swiper.id).first()
    if reverse_swipe:
        # Sprawdź, czy match już istnieje
        existing_match = Match.query.filter(
            ((Match.user1_id == swiper.id) & (Match.user2_id == target.id)) |
            ((Match.user1_id == target.id) & (Match.user2_id == swiper.id))
        ).first()

        if not existing_match:
            new_match = Match(user1_id=min(swiper.id, target.id), user2_id=max(swiper.id, target.id))
            db.session.add(new_match)
            db.session.commit()

            # Emituj do obydwu użytkowników
            for user in [swiper.username, target.username]:
                sid = connected_users.get(user)
                if sid:
                    emit("match-found", {
                        "with": target.username if user == swiper.username else swiper.username,
                        "message": "Chyba znalezlismy pare do twojego crocsa",
                        "is_initiator": user == swiper.username
                    }, to=sid)

        return jsonify({"match": True})

    return jsonify({"match": False})


# ===== KONFIGURACJA UPLOADÓW =====
app.config['UPLOAD_FOLDER_PROFILE'] = os.path.join(os.getcwd(), 'uploads')
app.config['UPLOAD_FOLDER_CARD'] = os.path.join(os.getcwd(), 'swipe_uploads')
os.makedirs(app.config['UPLOAD_FOLDER_PROFILE'], exist_ok=True)
os.makedirs(app.config['UPLOAD_FOLDER_CARD'], exist_ok=True)

# ===== POZOSTAŁE ENDPOINTY =====
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    default_pic = 'Nowy_projekt_5.png'

    if User.query.filter_by(username=username).first():
        return jsonify({"Message": "User already exist"}), 400

    hashed_password = generate_password_hash(password)
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
@app.route('/api/matches/<username>', methods=['GET'])
def get_user_matches(username):
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'matches': []})

    # Pobierz wszystkie matche gdzie user jest user1 lub user2
    user_matches = Match.query.filter(
        (Match.user1_id == user.id) | (Match.user2_id == user.id)
    ).all()

    matches_list = []
    for match in user_matches:
        matched_user_id = match.user2_id if match.user1_id == user.id else match.user1_id
        matched_user = User.query.filter_by(id=matched_user_id).first()
        if matched_user:
            # Pobierz personal data (dla zdjęcia profilowego, jeśli chcesz)
            personal = matched_user.personal_data
            matches_list.append({
                'username': matched_user.username,
                'first_name': personal.first_name if personal else '',
                'last_name': personal.last_name if personal else '',
                'profile_pic': personal.profile_pic if personal else '',
                'message': f'Masz nowy match z {matched_user.username}'
            })

    return jsonify({'matches': matches_list})

@app.route('/search_profiles', methods=['GET'])
def search_profile():
    query = request.args.get('q')
    username = request.headers.get('username')

    current_user = User.query.filter_by(username=username).first()
    if not current_user or not query:
        return jsonify({"profiles": []})

    profiles = db.session.query(Personal_Data, User).join(User).filter(
        Personal_Data.last_name.ilike(f'%{query}%') |
        User.username.ilike(f'%{query}%')
    ).all()

    results = []
    for personal, user in profiles:
        if user.id == current_user.id:
            continue

        matched = Match.query.filter(
            ((Match.user1_id == current_user.id) & (Match.user2_id == user.id)) |
            ((Match.user1_id == user.id) & (Match.user2_id == current_user.id))
        ).first() is not None

        results.append({
            "username": user.username,
            "profile_pic": personal.profile_pic,
            "match": matched
        })

    return jsonify({"profiles": results})

@app.route('/all_card_images')
def all_card_images():
    username = request.headers.get('username')
    current_user = User.query.filter_by(username=username).first()
    if not current_user:
        return jsonify({"photos": []})

    swiped = db.session.query(Swipe.target_id).filter_by(swiper_id=current_user.id).subquery()

    profiles = Personal_Data.query.filter(
        Personal_Data.user_id != current_user.id,
        Personal_Data.card_image != None,
        ~Personal_Data.user_id.in_(swiped)
    ).all()

    photos = [{
        "username": p.user.username,
        "card_image": p.card_image
    } for p in profiles]

    return jsonify({"photos": photos})

# wiadomosci miedzy userami
@app.route("/api/messages/<user1>/<user2>", methods=["GET"])
def get_messages(user1, user2):
    u1 = User.query.filter_by(username=user1).first()
    u2 = User.query.filter_by(username=user2).first()

    if not u1 or not u2:
        return jsonify({"messages": []})

    msgs = Message.query.filter(
        ((Message.sender_id == u1.id) & (Message.receiver_id == u2.id)) |
        ((Message.sender_id == u2.id) & (Message.receiver_id == u1.id))
    ).order_by(Message.id.asc()).all()

    message_list = [
        {
            "from": m.sender_id == u1.id and user1 or user2,
            "message": m.content
        } for m in msgs
    ]

    return jsonify({"messages": message_list})


# === URUCHOMIENIE ===
if __name__ == "__main__":
    #with app.app_context():
        #db.drop_all()
        #db.create_all()
    socketio.run(app, debug=True)