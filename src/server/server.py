from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import cv2
from components.doc_scanner import document_scanner 
from components.type_scanner import type_scanner
from components.preprocess0 import preprocess0
from components.preprocess1_3 import preprocess1_3

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
                if i == 0:
                    preprocess0(type_image, i, app.config['UPLOAD_FOLDER'], app)
                    
                else:
                    preprocess1_3(type_image, i, app.config['UPLOAD_FOLDER'], app)
                
        return jsonify({'message': 'Image uploaded, scanned, and preprocessed successfully'})

@app.route('/get-image', methods=['GET'])
def get_image():
    image_index = request.args.get('index', type=int, default=0)  # Get the 'index' query parameter with a default value of 0
    if image_index < 0 or image_index > 3:
        return jsonify({'error': 'Invalid image index'})

    image_filenames = [
        'type_0_image2threshold.jpg',
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
