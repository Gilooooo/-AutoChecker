
import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const ImageWebcam = ({ onImageCapture }) => {
  const webcamRef = useRef(null);

  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [retrievedImage, setRetrievedImage] = useState(null);

  const toggleWebcam = () => {
    setWebcamEnabled(!webcamEnabled);
  };

  const capture = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setWebcamEnabled(true);
      onImageCapture(imageSrc);
    }
  };

  return (
    <div>
      {webcamEnabled ? (
        <div>
          <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" />
          <br />
          <button onClick={capture}>Capture Image</button>
          <button onClick={toggleWebcam} className="disable-webcam-button">
            Disable Webcam
          </button>
        </div>
      ) : (
        <button onClick={toggleWebcam} className="enable-webcam-button">
          Enable Webcam
        </button>
      )}
      {retrievedImage && (
        <img
          src={retrievedImage}
          alt="Retrieved Image"
          style={{ maxWidth: '100%' }}
        />
      )}
    </div>
  );
};

export default ImageWebcam;
