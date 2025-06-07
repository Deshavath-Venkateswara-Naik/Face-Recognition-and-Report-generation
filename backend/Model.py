import cv2
import numpy as np
from mtcnn import MTCNN
from keras_facenet import FaceNet
from sklearn.preprocessing import Normalizer
from sklearn.svm import SVC
import pickle
import os

# Initialize the FaceNet model and MTCNN detector
model = FaceNet()
detector = MTCNN()
normalizer = Normalizer(norm='l2')
THRESHOLD = 0.25  # Confidence threshold for recognition

# Function to extract a face from an image
def extract_face(image, required_size=(160, 160)):
    faces = detector.detect_faces(image)
    face_images = []
    face_boxes = []
    
    for face in faces:
        x, y, width, height = face['box']
        x, y = abs(x), abs(y)
        face_img = image[y:y+height, x:x+width]
        face_img = cv2.resize(face_img, required_size)
        face_images.append(face_img)
        face_boxes.append((x, y, width, height))
    
    return face_images, face_boxes

# Function to get face embedding
def get_embedding(face_pixels):
    face_pixels = np.expand_dims(face_pixels, axis=0)
    embedding = model.embeddings(face_pixels)
    return embedding[0]

# Load Training Data (Images should be stored in `Faces/{name}/image.jpg`)
def load_dataset(directory):
    X, y = [], []
    for subdir in os.listdir(directory):
        path = os.path.join(directory, subdir)
        if not os.path.isdir(path):
            continue
        for filename in os.listdir(path):
            filepath = os.path.join(path, filename)
            image = cv2.imread(filepath)
            faces, _ = extract_face(image)
            for face in faces:
                embedding = get_embedding(face)
                X.append(embedding)
                y.append(subdir)
    return np.array(X), np.array(y)

# Train the Model
X_train, y_train = load_dataset('dataset')
X_train = normalizer.transform(X_train)

classifier = SVC(kernel='linear', probability=True)
classifier.fit(X_train, y_train)

# Save Model
with open('face_recognizer.pkl', 'wb') as f:
    pickle.dump(classifier, f)

# Load Model for Recognition
with open('face_recognizer.pkl', 'rb') as f:
    classifier = pickle.load(f)

# Real-Time Face Recognition
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        continue
    
    faces, boxes = extract_face(frame)
    
    for i, face in enumerate(faces):
        embedding = get_embedding(face)
        embedding = normalizer.transform([embedding])
        prediction = classifier.predict(embedding)
        probabilities = classifier.predict_proba(embedding)
        probability = probabilities.max()  # Get highest probability
        
        label = prediction[0] if probability >= THRESHOLD else "Unknown"
        x, y, w, h = boxes[i]
        label_text = f"{label} ({probability:.2f})"
        
        # Draw bounding box and label
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
        cv2.putText(frame, label_text, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 0), 2)

    cv2.imshow('Face Recognition', frame)
    
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

