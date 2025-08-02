from flask import Flask, request, jsonify
import cv2
import numpy as np
import base64
import os
import pickle
import mysql.connector
from flask_cors import CORS
from datetime import datetime

from mtcnn import MTCNN
from keras_facenet import FaceNet
from sklearn.preprocessing import Normalizer
from sklearn.svm import SVC

MODEL_PATH = 'face_recognizer.pkl'
DATASET_PATH = 'Faces1'
THRESHOLD = 0.25
REQUIRED_SIZE = (160, 160)
FORCE_RETRAIN = False

db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Aswini@123',
    'database': 'face_recognition'
}


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

model = FaceNet()
detector = MTCNN()
normalizer = Normalizer(norm='l2')


def extract_face(image, required_size=REQUIRED_SIZE):
    faces = detector.detect_faces(image)
    face_images, face_boxes = [], []

    for face in faces:
        x, y, width, height = face['box']
        x, y = abs(x), abs(y)
        face_img = image[y:y+height, x:x+width]
        face_img = cv2.resize(face_img, required_size)
        face_images.append(face_img)
        face_boxes.append((x, y, width, height))

    return face_images, face_boxes

def get_embedding(face_pixels):
    face_pixels = np.expand_dims(face_pixels, axis=0)
    embedding = model.embeddings(face_pixels)
    return embedding[0]

def load_dataset(directory):
    X, y = [], []
    if not os.path.exists(directory):
        os.makedirs(directory)

    for subdir in os.listdir(directory):
        path = os.path.join(directory, subdir)
        if not os.path.isdir(path):
            continue
        for filename in os.listdir(path):
            filepath = os.path.join(path, filename)
            image = cv2.imread(filepath)
            if image is None:
                continue
            faces, _ = extract_face(image)
            for face in faces:
                embedding = get_embedding(face)
                X.append(embedding)
                y.append(subdir)
    return np.array(X), np.array(y)

def train_or_load_model():
    if not FORCE_RETRAIN and os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, 'rb') as f:
            return pickle.load(f)
    else:
        X_train, y_train = load_dataset(DATASET_PATH)
        X_train = normalizer.transform(X_train)

        classifier = SVC(kernel='linear', probability=True)
        classifier.fit(X_train, y_train)

        with open(MODEL_PATH, 'wb') as f:
            pickle.dump(classifier, f)

        return classifier

def get_registered_users_with_images():
    users = []
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM registered_users")
        user_rows = cursor.fetchall()
        cursor.close()
        conn.close()

        for user in user_rows:
            folder_path = os.path.join(DATASET_PATH, user['user_id'])
            img_files = [f for f in os.listdir(folder_path) if f.endswith(('.png', '.jpg'))] if os.path.exists(folder_path) else []
            encoded = None
            if img_files:
                with open(os.path.join(folder_path, img_files[0]), "rb") as img:
                    encoded = base64.b64encode(img.read()).decode('utf-8')

            user['image'] = encoded
            users.append(user)
    except Exception as e:
        print("DB Error:", str(e))

    return users


classifier = train_or_load_model()


@app.route('/register', methods=['POST', 'OPTIONS'])
def register_face():
    if request.method == 'OPTIONS':
        return '', 204

    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    user_id = data.get('user_id')
    role = data.get('role')
    purpose = data.get('purpose')
    image_data = data.get('image', '').split(',')[1]

    if not user_id or not name:
        return jsonify({'error': 'User ID and Name are required'}), 400

    try:
        save_path = os.path.join(DATASET_PATH, user_id)
        os.makedirs(save_path, exist_ok=True)

        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        augmented_images = [
            img, cv2.flip(img, 1), cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE),
            cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE), cv2.GaussianBlur(img, (5, 5), 0),
            cv2.resize(img, (int(img.shape[1]*0.9), int(img.shape[0]*0.9))),
            cv2.resize(img, (int(img.shape[1]*1.1), int(img.shape[0]*1.1))),
            cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), 
            cv2.convertScaleAbs(img, alpha=1.2, beta=30),
            cv2.convertScaleAbs(img, alpha=0.8, beta=-30),
            cv2.blur(img, (3, 3)), cv2.GaussianBlur(img, (9, 9), 0),
            cv2.bilateralFilter(img, 9, 75, 75), cv2.medianBlur(img, 5)
        ]
        gray_hist = cv2.equalizeHist(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY))
        if len(gray_hist.shape) == 2:
            gray_hist = cv2.cvtColor(gray_hist, cv2.COLOR_GRAY2BGR)
        augmented_images.append(gray_hist)

        while len(augmented_images) < 20:
            noisy = img.copy()
            noise = np.random.normal(0, 10, noisy.shape).astype(np.uint8)
            noisy = cv2.add(noisy, noise)
            augmented_images.append(noisy)

        for idx, aug_img in enumerate(augmented_images[:20]):
            if len(aug_img.shape) == 2:
                aug_img = cv2.cvtColor(aug_img, cv2.COLOR_GRAY2BGR)
            filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{idx}.jpg"
            filepath = os.path.join(save_path, filename)
            cv2.imwrite(filepath, aug_img)

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute(""" 
            INSERT INTO registered_users (name, email, user_id, role, purpose, created_at) 
            VALUES (%s, %s, %s, %s, %s, NOW())
        """, (name, email, user_id, role, purpose))
        conn.commit()
        cursor.close()
        conn.close()

        global classifier
        classifier = train_or_load_model()

        return jsonify({'message': f"{name} registered with ID {user_id}"}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/recognize', methods=['POST', 'OPTIONS'])
def recognize_face():
    if request.method == 'OPTIONS':
        return '', 204

    data = request.get_json()
    image_data = data.get('image', '').split(',')[1]

    try:
        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        faces, boxes = extract_face(img)
        if not faces:
            return jsonify({'results': []})

        results = []
        for i, face in enumerate(faces):
            embedding = get_embedding(face)
            embedding = normalizer.transform([embedding])
            prediction = classifier.predict(embedding)
            probabilities = classifier.predict_proba(embedding)
            confidence = float(probabilities.max())

            label = prediction[0] if confidence >= THRESHOLD else "Unknown"
            results.append({
                'label': label,
                'confidence': f"{confidence:.2f}",
                'box': boxes[i]
            })

        return jsonify({'results': results})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/delete_user/<user_id>', methods=['DELETE', 'OPTIONS'])
def delete_user(user_id):
    if request.method == 'OPTIONS':
        return '', 204

    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM registered_users WHERE user_id = %s", (user_id,))
        if cursor.fetchone()[0] == 0:
            return jsonify({'error': f"User with ID {user_id} does not exist"}), 404

        cursor.execute("DELETE FROM registered_users WHERE user_id = %s", (user_id,))
        conn.commit()

        user_folder = os.path.join(DATASET_PATH, user_id)
        if os.path.exists(user_folder):
            for root, dirs, files in os.walk(user_folder):
                for file in files:
                    os.remove(os.path.join(root, file))
            os.rmdir(user_folder)

        cursor.close()
        conn.close()

        global classifier
        classifier = train_or_load_model()

        return jsonify({'message': f"User {user_id} deleted successfully"}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/registered_users', methods=['GET'])
def list_users():
    return jsonify({'users': get_registered_users_with_images()})

@app.route('/api/users/<user_id>',methods= ['PUT', 'OPTIONS'])
def edit_user(user_id):
    if request.method == 'OPTIONS':
        return '', 204

    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    role = data.get('role')
    purpose = data.get('purpose')
    new_image_data = data.get('image')

    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM registered_users WHERE user_id = %s", (user_id,))
        if cursor.fetchone()[0] == 0:
            return jsonify({'error': f"User with ID {user_id} does not exist"}), 404

        cursor.execute(""" 
            UPDATE registered_users 
            SET name = %s, email = %s, role = %s, purpose = %s 
            WHERE user_id = %s
        """, (name, email, role, purpose, user_id))
        conn.commit()

        cursor.close()
        conn.close()

      
        if new_image_data:
            save_path = os.path.join(DATASET_PATH, user_id)
            if os.path.exists(save_path):
                for root, dirs, files in os.walk(save_path):
                    for file in files:
                        os.remove(os.path.join(root, file))
            else:
               
                os.makedirs(save_path, exist_ok=True)

            new_image_bytes = base64.b64decode(new_image_data.split(',')[1])
            nparr = np.frombuffer(new_image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            augmented_images = [
                img, cv2.flip(img, 1), cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE),
                cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE), cv2.GaussianBlur(img, (5, 5), 0)
            ]

            while len(augmented_images) < 20:
                noisy_img = img.copy()
                noise = np.random.normal(0, 10, noisy_img.shape).astype(np.uint8)
                noisy_img = cv2.add(noisy_img, noise)
                augmented_images.append(noisy_img)

            for idx, aug_img in enumerate(augmented_images[:20]):
                filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{idx}.jpg"
                filepath = os.path.join(save_path, filename)
                cv2.imwrite(filepath, aug_img)

            global classifier
            classifier = train_or_load_model()

        return jsonify({'message': f"User {user_id} updated successfully."}), 200
    except Exception as e:
        print(f"Error updating user {user_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
    