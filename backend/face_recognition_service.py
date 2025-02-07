import face_recognition
import cv2
import numpy as np
import pickle
import time
from supabase import create_client
import base64
import io
from PIL import Image
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Supabase client
supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

def base64_to_image(base64_string):
    # Remove data URL prefix if present
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    
    # Decode base64 string to bytes
    image_bytes = base64.b64decode(base64_string)
    
    # Convert bytes to image
    image = Image.open(io.BytesIO(image_bytes))
    return np.array(image)

def train_face_recognition_model():
    # Fetch all faces from database
    response = supabase.table('face_recognition').select('*').execute()
    
    if not response.data:
        raise Exception("No faces found in database")

    # Initialize lists to store encodings and labels
    known_face_encodings = []
    known_face_labels = []

    # Process each face in the database
    for face_data in response.data:
        try:
            # Convert base64 to image
            image = base64_to_image(face_data['image_data'])
            
            # Get face encoding
            face_locations = face_recognition.face_locations(image)
            if not face_locations:
                print(f"No face found in image for {face_data['label']}")
                continue
                
            face_encoding = face_recognition.face_encodings(image, face_locations)[0]
            
            # Add to our lists
            known_face_encodings.append(face_encoding)
            known_face_labels.append(face_data['label'])
            
        except Exception as e:
            print(f"Error processing image for {face_data['label']}: {str(e)}")
            continue

    # Save the model
    model_data = {
        'encodings': known_face_encodings,
        'labels': known_face_labels
    }
    
    with open('face_recognition_model.pkl', 'wb') as f:
        pickle.dump(model_data, f)
    
    return model_data

def recognize_faces_webcam():
    # Load the trained model
    with open('face_recognition_model.pkl', 'rb') as f:
        model_data = pickle.load(f)
    
    known_face_encodings = model_data['encodings']
    known_face_labels = model_data['labels']
    
    # Initialize webcam
    video_capture = cv2.VideoCapture(0)
    
    # Initialize variables
    face_locations = []
    face_encodings = []
    face_names = []
    process_this_frame = True
    open_door = False
    last_detection_time = 0
    detection_timeout = 5  # Seconds before resetting door state
    
    try:
        # Grab a single frame of video
        ret, frame = video_capture.read()
        
        if not ret:
            raise Exception("Could not access webcam")
            
        # Only process every other frame to save time
        if process_this_frame:
            # Resize frame for faster face recognition
            small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
            
            # Convert the image from BGR color to RGB color
            rgb_small_frame = small_frame[:, :, ::-1]
            
            # Find all faces in the current frame
            face_locations = face_recognition.face_locations(rgb_small_frame)
            face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)
            
            for face_encoding in face_encodings:
                # See if the face is a match for the known faces
                matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=0.6)
                
                if True in matches:
                    open_door = True
                    last_detection_time = time.time()
                    break
    
    finally:
        # Release handle to the webcam
        video_capture.release()
    
    return open_door