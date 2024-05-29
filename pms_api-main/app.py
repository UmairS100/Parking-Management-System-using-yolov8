# FOR CCTV

from flask import Flask, request, jsonify
from ultralytics import YOLO
import cv2
import re
import numpy as np
import pytesseract
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

INDIAN_NUMBER_PLATE_PATTERN = r'^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$'

# Load the YOLOv8 model
model = YOLO("model/best.pt")

def perform_ocr(cropped_img):
    predicted_result = pytesseract.image_to_string(cropped_img, lang ='eng', 
    config='--oem 3 --psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') 
    filter_predicted_result = "".join(predicted_result.split()).replace(":", "").replace("-", "") 
    return filter_predicted_result

def is_indian_number_plate(number_plate):
    return re.match(INDIAN_NUMBER_PLATE_PATTERN, number_plate) is not None

def predict_number_plate(image):
    # Perform inference
    predictions = model(image, imgsz=640)
    return predictions

@app.route('/upload', methods=['POST'])
def upload():
    # Read RTSP stream
    cap = cv2.VideoCapture('rtsp://192.168.1.100:8080/h264_pcm.sdp')

    if not cap.isOpened():
        print("Error: Unable to open RTSP stream")
        return jsonify({'error': 'Unable to open RTSP stream'}), 500

    # Read frames from the RTSP stream
    ret, frame = cap.read()
    cap.release()

    if not ret:
        print("Error: Unable to read frame from RTSP stream")
        return jsonify({'error': 'Unable to read frame from RTSP stream'}), 500

    # Perform number plate recognition
    results = predict_number_plate(frame)

    if results:
        for result in results:
            if len(result):
                for box in result.boxes:
                    if box.conf.item() > 0.6:
                        left, top, right, bottom = np.array(box.xyxy.cpu(), dtype=int).squeeze()
                        cropped_img = frame[top:bottom, left:right]
                        text = perform_ocr(cropped_img)
                        # if len(text) < 10 or len(text) > 10:
                        #     print("Error: Detected number length is not 10")
                        #     return jsonify({'error': 'Detected number length is not 10'}), 500
                        # else:
                        print('Vehicle number:', text)
                        return jsonify({'vehicle_number': text}), 200
                    else:
                        print("Error: Low Confidence Score")
                        return jsonify({'error': 'Low Confidence Score'}), 500
        print('Error: No objects detected in the image')
        return jsonify({'error': 'No objects detected in the image'}), 500
    else:
        print('Error: No objects detected in the image')
        return jsonify({'error': 'No objects detected in the image'}), 500

if __name__ == '__main__':
    app.run(debug=True)
