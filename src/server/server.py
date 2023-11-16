from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import cv2
from components.doc_scanner import document_scanner 
from components.type_scanner import type_scanner
import numpy as np
from skimage.filters import threshold_local

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/post-image', methods=['POST'])
def post_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image part'})
    
    image = request.files['image']
    if image.filename == '':
        return jsonify({'error': 'No selected image'})

    if image:
        filename = os.path.join(app.config['UPLOAD_FOLDER'], 'image1_original.jpg')
        image.save(filename)
        image = cv2.imread(filename)

        #auto crop and transform
        cropped_filename = document_scanner(image, app.config['UPLOAD_FOLDER'])
        image = cv2.imread(cropped_filename)

        # Type scanner
        type_images = type_scanner(image, app.config['UPLOAD_FOLDER'])
        for i in range(4):
            type_filename = os.path.join(app.config['UPLOAD_FOLDER'], f'type_{i}_image.jpg')
            if os.path.exists(type_filename):
                type_image = cv2.imread(type_filename)

                # Preprocess
                # Convert to grayscale
                gray_type_image = cv2.cvtColor(type_image, cv2.COLOR_BGR2GRAY)
                grayscale_filename = os.path.join(app.config['UPLOAD_FOLDER'], f'type_{i}_image1grayscale.jpg')
                cv2.imwrite(grayscale_filename, gray_type_image)
                # Noise Reduction
                remove_noise = cv2.GaussianBlur(gray_type_image, (5, 5), 0)
                T = threshold_local(remove_noise, 11, offset=10, method="gaussian")
                threshold = (remove_noise > T).astype("uint8") * 255
                threshold_filename = os.path.join(app.config['UPLOAD_FOLDER'], f'type_{i}_image2threshold.jpg')
                cv2.imwrite(threshold_filename, threshold)
                # Dilation
                kernel = np.ones((1, 2), np.uint8)
                dilate = cv2.dilate(threshold, kernel, iterations=1)
                dilate_filename = os.path.join(app.config['UPLOAD_FOLDER'], f'type_{i}_image3dilate.jpg')
                cv2.imwrite(dilate_filename, dilate)
                # Morphological opening
                kernel = np.ones((3, 3), np.uint8)
                opening = cv2.morphologyEx(dilate, cv2.MORPH_OPEN, kernel)
                opening_filename = os.path.join(app.config['UPLOAD_FOLDER'], f'type_{i}_image4opening.jpg')
                cv2.imwrite(opening_filename, opening)
                # Erosion
                kernel = np.ones((2, 3), np.uint8)
                erode = cv2.erode(opening, kernel, iterations=1)
                erode_filename = os.path.join(app.config['UPLOAD_FOLDER'], f'type_{i}_image5erode.jpg')
                cv2.imwrite(erode_filename, erode)
                # Morphological closing
                kernel = np.ones((3, 3), np.uint8)
                closing = cv2.morphologyEx(erode, cv2.MORPH_CLOSE, kernel)
                closing_filename = os.path.join(app.config['UPLOAD_FOLDER'], f'type_{i}_image6closing.jpg')
                cv2.imwrite(closing_filename, closing)


        return jsonify({'message': 'Image uploaded, scanned, and preprocessed successfully'})

@app.route('/get-image', methods=['GET'])
def get_image():
    image_index = request.args.get('index', type=int, default=0)  # Get the 'index' query parameter with a default value of 0
    if image_index < 0 or image_index > 3:
        return jsonify({'error': 'Invalid image index'})

    image_filenames = [
        'type_0_image1grayscale.jpg',
        'type_1_image6closing.jpg',
        'type_2_image6closing.jpg',
        'type_3_image6closing.jpg'
    ]
    
    image_filename = os.path.join(app.config['UPLOAD_FOLDER'], image_filenames[image_index])

    if not os.path.exists(image_filename):
        return jsonify({'error': 'Image not found'})

    return send_file(image_filename, as_attachment=True)

if __name__ == '__main__':
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.run(debug=True, port=3002)