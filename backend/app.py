from flask import Flask, jsonify
from dotenv import load_dotenv
import os
from face_recognition_service import train_face_recognition_model, recognize_faces_webcam

load_dotenv()

app = Flask(__name__)

@app.route('/train', methods=['POST'])
def train():
    try:
        model_data = train_face_recognition_model()
        return jsonify({
            'success': True,
            'message': f"Model trained with {len(model_data['labels'])} faces"
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/recognize', methods=['POST'])
def recognize():
    try:
        is_door_open = recognize_faces_webcam()
        return jsonify({
            'success': True,
            'door_status': 'open' if is_door_open else 'closed'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)