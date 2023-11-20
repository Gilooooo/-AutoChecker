import os
import cv2
import numpy as np
import imutils
from skimage.filters import threshold_local

def preprocess1_3(type_image, i, upload_folder, app):
    image = imutils.resize(type_image, height=type_image.shape[0])
    # Grayscale
    gray_type_image = cv2.cvtColor(type_image, cv2.COLOR_BGR2GRAY)
    grayscale_filename = os.path.join(upload_folder, f'type_{i}_image1grayscale.jpg')
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
    dilate_filename = os.path.join(upload_folder, f'type_{i}_image3dilate.jpg')
    cv2.imwrite(dilate_filename, dilate)

    # Morphological opening
    kernel = np.ones((2, 3), np.uint8)
    opening = cv2.morphologyEx(dilate, cv2.MORPH_OPEN, kernel)
    opening_filename = os.path.join(upload_folder, f'type_{i}_image4opening.jpg')
    cv2.imwrite(opening_filename, opening)

    # Erosion
    kernel = np.ones((2, 3), np.uint8)
    erode = cv2.erode(opening, kernel, iterations=1)
    erode_filename = os.path.join(upload_folder, f'type_{i}_image5erode.jpg')
    cv2.imwrite(erode_filename, erode)

    # Morphological closing
    kernel = np.ones((3, 3), np.uint8)
    closing = cv2.morphologyEx(erode, cv2.MORPH_CLOSE, kernel)
    closing_filename = os.path.join(upload_folder, f'type_{i}_image6closing.jpg')
    cv2.imwrite(closing_filename, closing)
    
    return closing