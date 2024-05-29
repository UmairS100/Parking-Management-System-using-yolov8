from flask import Flask, request, render_template,jsonify
from ultralytics import YOLO
from werkzeug.datastructures import FileStorage
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

@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')
# Define a function to perform inference on an image
def predict_number_plate(image_file):
    img = cv2.imdecode(np.frombuffer(image_file, np.uint8), cv2.IMREAD_COLOR)
    # Perform inference
    predictions = model(img, imgsz=640)
    return predictions, img

def perform_ocr(cropped_img):
    predicted_result = pytesseract.image_to_string(cropped_img, lang ='eng', 
    config='--oem 3 --psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') 
    filter_predicted_result = "".join(predicted_result.split
    ()).replace(":", "").replace("-", "") 
    return filter_predicted_result

def is_indian_number_plate(number_plate):
    return re.match(INDIAN_NUMBER_PLATE_PATTERN, number_plate) is not None

# Route to handle image upload and perform inference
@app.route('/upload', methods=['POST'])
def upload():
    if 'image' not in request.files:
        print("No image selected")
        return ({'error': 'No image uploaded'}), 500

    image_file = request.files['image']

    # Ensure the file is an image
    if image_file.filename == '':
        print("No image selected")
        return ({'error': 'No image selected'}), 500

    image_data = image_file.read()
    # Convert the image data to a numpy array
    image_array = np.frombuffer(image_data, np.uint8)

    # Decode the numpy array into an image
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    #Now you can use cv2.imwrite to save the image
    # cv2.imwrite('captured_image.jpg', image)
    # Perform inference
    results, img = predict_number_plate(image_data)
    
    if results  :
        for result in results:
            if len(result) :
                for box in result.boxes:
                    if(box.conf.item()>0.8):
                        left, top, right, bottom = np.array(box.xyxy.cpu(), dtype=int).squeeze()
                        cropped_img = img[top:bottom, left:right]
                        # Save the cropped image
                        cv2.imwrite('cropped_image.jpg', cropped_img)
                        text = perform_ocr(cropped_img)
                        if(len(text)<10 and len(text)>10):
                            print("Detetcted number less than 10")
                            return jsonify({'error': 'Detetcted number less than 10'}), 500
                        else:
                            print('vehicle_number')
                            return jsonify({'vehicle_number': text}), 200
                        # if is_indian_number_plate(text):
                        #     return jsonify({'vehicle_number': text}), 200
                        # else:
                        #     return jsonify({'error': 'Not an Indian number plate'}), 500
                    else:
                        print("Low Confidence Score")
                        return jsonify({'error': 'Low Confidence Score'}), 500
            print('No objects detected up in the image')
            return jsonify({'error': 'No objects detected in the image'}), 500
    else:
        print('No objects detected in the image')
        return jsonify({'error': 'No objects detected in the image'}), 500
    

if __name__ == '__main__':
    app.run(debug=True)
