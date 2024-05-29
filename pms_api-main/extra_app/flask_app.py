from flask import Flask, request, render_template,jsonify
from ultralytics import YOLO
import cv2
import numpy as np
import pytesseract

app = Flask(__name__)

# Load the YOLOv8 model
model = YOLO("model/best.pt")

@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')
# Define a function to perform inference on an image
def predict_number_plate(image_file):
    img = cv2.imdecode(np.frombuffer(image_file.read(), np.uint8), cv2.IMREAD_COLOR)
    # Perform inference
    predictions = model(img, imgsz=640)
    return predictions, img

def perform_ocr(cropped_img):
    predicted_result = pytesseract.image_to_string(cropped_img, lang ='eng', 
    config='--oem 3 --psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') 
   
    filter_predicted_result = "".join(predicted_result.split
    ()).replace(":", "").replace("-", "") 
    
    return filter_predicted_result

# Route to handle image upload and perform inference
@app.route('/upload', methods=['POST'])
def upload():
    if 'image' not in request.files:
        return ({'error': 'No image uploaded'}), 400

    image_file = request.files['image']

    # Ensure the file is an image
    if image_file.filename == '':
        return ({'error': 'No image selected'}), 400

    # Perform inference
    results, img = predict_number_plate(image_file)

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
                        return jsonify({'vehicle_number': text}), 200
                    else:
                        return jsonify({'error': 'Low Confidence Score'}), 400
            return jsonify({'error': 'No objects detected in the image'}), 400
    else:
        return jsonify({'error': 'No objects detected in the image'}), 400
    

if __name__ == '__main__':
    app.run(debug=True)
