from flask import Flask ,session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from flask_socketio import SocketIO
from werkzeug.utils import secure_filename
import os




app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://another-origin.com"]}}, supports_credentials=True)

app.config['UPLOAD_FOLDER'] = 'uploads/'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}
app.config['SECRET_KEY'] = '12hj1hj1hj2h1j'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SECURE'] = False


db = SQLAlchemy(app)
socketio = SocketIO(app, cors_allowed_origins="*")