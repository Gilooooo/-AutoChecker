import cv2
import os
import imutils
from imutils.perspective import four_point_transform
from skimage.filters import threshold_local

def document_scanner(image, upload_folder):
    ratio = image.shape[0] / 500.0
    orig = image.copy()
    image = imutils.resize(image, height=500)

    # PAPER SCANNER
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    edged = cv2.Canny(gray, 75, 200)
    edged_filename = os.path.join(upload_folder, 'image2.1_edged.jpg')
    cv2.imwrite(edged_filename, edged)

    blur = cv2.GaussianBlur(gray, (5, 5), 0)

    _, threshold = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    threshold_filename = os.path.join(upload_folder, 'image2.2_thresholded.jpg')
    cv2.imwrite(threshold_filename, threshold)

    # find the contours in the edged image, keeping only the largest ones, and initialize the screen contour
    cnts = cv2.findContours(edged, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    cnts = imutils.grab_contours(cnts)
    cnts = sorted(cnts, key=cv2.contourArea, reverse=True)[:5]

    for c in cnts:
        peri = cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, 0.02 * peri, True)

        if len(approx) == 4:
            screenCnt = approx
            break

    if len(approx) != 4:
        cnts = cv2.findContours(threshold, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
        cnts = imutils.grab_contours(cnts)
        cnts = sorted(cnts, key=cv2.contourArea, reverse=True)[:5]

    for c in cnts:
        peri = cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, 0.02 * peri, True)

        if len(approx) == 4:
            screenCnt = approx
            break

    cv2.drawContours(image, [screenCnt], -1, (0, 255, 0), 2)
    cnts_filename = os.path.join(upload_folder, 'image3_cnts.jpg')
    cv2.imwrite(cnts_filename, image)

    # Apply four-point perspective transform to the original image
    warped = four_point_transform(orig, screenCnt.reshape(4, 2) * ratio)
    warped_filename = os.path.join(upload_folder, 'image4_warped.jpg')
    cv2.imwrite(warped_filename, warped)

    margin = 10  # You can adjust this value to control the amount of cropping
    height, width = warped.shape[:2]
    cropped = warped[margin:height - margin, margin:width - margin]
    # Save the cropped and transformed image
    cropped_filename = os.path.join(upload_folder, 'image5_cropped.jpg')
    cv2.imwrite(cropped_filename, cropped)

    return cropped_filename
