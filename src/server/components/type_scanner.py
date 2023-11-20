import cv2
import os
import imutils
def type_scanner(image, upload_folder):
    image = imutils.resize(image, height=image.shape[0])
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    edged = cv2.Canny(blur, 50, 150)
    
    contours, _ = cv2.findContours(edged, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    contours = sorted(contours, key=lambda c: (cv2.boundingRect(c)[1], cv2.boundingRect(c)[0]))

    # Sort the contours from left to right.
    for i in range(len(contours) - 1):
        if cv2.boundingRect(contours[i])[0] > cv2.boundingRect(contours[i + 1])[0]:
            contours[i], contours[i + 1] = contours[i + 1], contours[i]
    
    result = image.copy()
    cv2.drawContours(result, contours, -1, (0, 255, 0), 2)

    contours_filename = os.path.join(upload_folder, 'image6_cnts2.jpg')
    cv2.imwrite(contours_filename, result)

    for i, contour in enumerate(contours):
        x, y, w, h = cv2.boundingRect(contour)
        cropped = image[y:y+h, x:x+w]

        if 0 <= i <= 3:
            file_name = os.path.join(upload_folder, f'type_{i}_image.jpg')
        cv2.imwrite(file_name, cropped)

        margin = 20
        height, width = cropped.shape[:2]
        cropped = cropped[margin:height - margin, margin:width - margin]
        cv2.imwrite(file_name, cropped)

        if i >= 1: 
                left_crop_margin = 80
                cropped = cropped[:, left_crop_margin:]
            
        cv2.imwrite(file_name, cropped)

    return cropped

