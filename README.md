
# Face Recognition and Entry Monitoring System

An AI-powered face recognition system for secure entry management, designed to streamline user registration, entry tracking, and real-time monitoring with image-based authentication.

---

## 🚀 Features

-  User Registration with Profile Image Upload
-  AI-Powered Face Recognition using OpenCV
-  Real-time Entry Monitoring
-  Secure Admin Panel to Manage Users
-  User Editing with Image Replacement & Augmentation
-  Image Augmentation for Robust Face Recognition
-  MySQL Database Integration
-  Frontend built with React
-  Flask Backend API for seamless integration

---

## 🛠 Tech Stack

| Technology   | Description                     |
|--------------|---------------------------------|
| **Frontend** | React, Axios, React Router      |
| **Backend**  | Flask, OpenCV, Numpy            |
| **Database** | MySQL                           |
| **Image Processing** | OpenCV, Face Detection & Recognition |
| **Other**    | Git, GitHub, REST API           |

---

## 📁 Project Structure

```
FaceRecognitionAndEntryMonitoring/
├── backend/              # Flask Backend API
│   ├── app.py            # Main application
│   ├── dataset/          # Stores registered face images
│   └── ...               
├── frontend/             # React Frontend
│   ├── src/
│   │   ├── components/   # UI Components
│   │   └── App.jsx       # Main App
│   └── ...
└── README.md             # Project Documentation
```

---

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Chenna000/Face-Recognition-and-Entry-Monitoring.git
cd FaceRecognitionAndEntryMonitoring
```

### 2. Backend Setup (Flask)

```bash
cd backend
pip install -r requirements.txt
python app.py
```

> Make sure MySQL is running and database credentials are properly configured in `app.py`.

### 3. Frontend Setup (React)

```bash
cd frontend
npm install
npm run dev
```

---

## 📸 User Image Handling

- During user edit, profile images can be updated.
- New images replace old ones and go through automatic augmentation (rotation, flipping, blur) for improved recognition accuracy.
- Face recognition model re-trains after image updates.

---

## 🎯 Future Enhancements

- Live camera-based entry detection
- Real-time notifications for unauthorized access
- Admin activity logs
- Improved face recognition with deep learning models

---

## 📢 Acknowledgements

- OpenCV for image processing
- React for modern UI
- Flask for lightweight API development

---

## 🖋 Author

**Chenna Yenugu**  
[GitHub Profile](https://github.com/Chenna000)

---

## 📃 License

This project is for educational and research purposes only. Not for commercial use.
