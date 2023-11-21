import React, { useState, useEffect, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import axios from 'axios';

function TesseractOCR({ Image, UIDintestpaper, setLoading, setProgress, updateStudentId, onUIDDetected }) {
  const [recognizedText, setRecognizedText] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isPopUpVisible, setIsPopUpVisible] = useState(false);
  const [isSendingData, setIsSendingData] = useState(false);
  const [textDataArray, setTextDataArray] = useState([]);
  const [questionType, setQuestionType] = useState([]);
  const [TUPCID, setTUPCID] = useState(null);
  const [UID, setUID] = useState(null);
  const [loadingText, setLoadingText] = useState('');
  const [processedImageCount, setProcessedImageCount] = useState(0);
  const [uniqueTextSet, setUniqueTextSet] = useState(new Set());
  const [continueProcessing, setContinueProcessing] = useState(true);
  const [allImagesProcessed, setAllImagesProcessed] = useState(false);
  const hasSentDataRef = useRef(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSendButtonDisabled, setIsSendButtonDisabled] = useState(false);

  
  const recognizeText = async () => {
    if (!continueProcessing) {
      return; 
    }
    if (Image) {
      const worker = await createWorker('eng');
      try {
        await worker.setParameters({
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ',
        });

        for (let i = 0; i < 100; i++) {
          setLoadingProgress(i);
          if (i === 1) setLoadingText('STARTING');
          if (i === 20) setLoadingText('PREPROCESSING');
          if (i === 90) setLoadingText('FINALIZING');
          if (i === 100) setLoadingText('RESULT READY!');
          await new Promise((resolve) => setTimeout(resolve, 150));
        }

        setProgress(100);

        const { data: { text } } = await worker.recognize(Image);

        if (uniqueTextSet.has(text)) {
          // Skip if the text is repeated
          return;
        }

        uniqueTextSet.add(text); // Add unique text to the set

        let array = text.split('\n');
        array = array.filter((line) => line.trim() !== '');

        let questionTypes = [];

        for (const line of array) {
          if (line.includes('MULTIPLE CHOICE')) {
            questionTypes.push('MultipleChoice');
          }
          if (line.includes('TRUE OR FALSE')) {
            questionTypes.push('TrueFalse');
          }
          if (line.includes('IDENTIFICATION')) {
            questionTypes.push('Identification');
          }
        }

        if (array.length >= 2 && array[1].includes('NAME')) {
          array.splice(1, 1);
        }

        const resultsArray = array.filter((line) => {
          return (
            !questionTypes.some((type) => line.includes(type)) &&
            !line.includes('MULTIPLE CHOICE') &&
            !line.includes('TRUE OR FALSE') &&
            !line.includes('IDENTIFICATION')
          );
        });

        // Check if this is the last image
        if (processedImageCount === processedImageCount) {
          setAllImagesProcessed(true);
        }

        // Check if resultsArray is not empty before updating textDataArray
        if (resultsArray.length > 0) {
          for (const line of resultsArray) {
            if (line.includes('TUPC')) {
              const match = line.match(/TUPC(\d{2})(\d{4})/);
              if (match) {
                const newStudentId = `TUPC-${match[1]}-${match[2]}`;
                setTUPCID(newStudentId);
                updateStudentId(newStudentId); // Call the function to update studentid in AnswerKey
              }
            } else if (line.includes('UID')) {
              const uidMatch = line.match(/UID (\d+)/);
              if (uidMatch) {
                const recognizedUID = uidMatch[1];
                setUID(recognizedUID);
                onUIDDetected(recognizedUID);

                if (recognizedUID !== UIDintestpaper) {
                  alert('UID DOES NOT MATCH');
                  setIsPopUpVisible(false);
                  setLoadingText('');
                  break;
                }
              }
            }
          }

          const filteredResultsArray = resultsArray.filter((line) => {
            return !line.includes('TUPC') && !line.includes('UID');
          });

          setTextDataArray((prevData) => [
            ...prevData,
            {
              TUPCID,
              UID,
              questionType: [...questionTypes],
              answers: [...filteredResultsArray],
              score: ""
            },
          ]);

          setQuestionType(questionTypes);
          setRecognizedText(text);
          setIsPopUpVisible(true);
        }

        await worker.terminate();
      } catch (error) {
        console.error(error);
      }
    }
  }

  const sendTextToServer = async () => {
    if (hasSentDataRef.current) {
      // If data has already been sent, do nothing
      return;
    }
  
    // Set the flag to indicate that data has been sent
    hasSentDataRef.current = true;
  
    setIsSendingData(true);
  
    try {
      
  
      // Combine information from all images into a single set of data
      const formattedQuestionTypes = textDataArray.flatMap((data) =>
        data.questionType.map((type, index) => ({
          type: `TYPE ${index + 1}`,
          questionType: type,
        }))
      );
  
      const answersByImage = textDataArray
        .filter((data) => data.answers.length > 0)
        .flatMap((data, index) =>
          data.answers.map((answer, questionNumber) => ({
            type: `TYPE ${index + 1}`,
            answer,
            questionNumber: questionNumber + 1,
            questionType: formattedQuestionTypes.find(
              (formattedType) => formattedType.type === `TYPE ${index + 1}`
            ).questionType,
            score: 0,
          }))
        );
  
      // Perform a POST request to add data
      await axios.post('http://localhost:3001/results', {
        TUPCID,
        UID,
        questionType: formattedQuestionTypes,
        answers: answersByImage,
      });
  
     
      const response = await axios.get(`http://localhost:3001/resultsexist/${UID}`);
  
      if (response.status === 200) {
        
        await axios.put(`http://localhost:3001/updateresults/${TUPCID}`, {
          questionType: formattedQuestionTypes,
          answers: answersByImage,
        });
      } else if (response.status === 404) {
       
        console.log('Data does not exist yet.');
      }
  
      setLoadingProgress(100);
      setLoadingText('COMPLETE');
  
      setTimeout(() => {
        setLoadingText('');
      }, 5000);
    } catch (error) {
      console.error('Error sending data to the server:', error);
    } finally {
      setIsSendingData(false);
      setIsPopUpVisible(false);
      setLoading(false);
      setProcessedImageCount(0); // Reset the processed image count
      setTextDataArray([]); // Reset the stored data array
      setUniqueTextSet(new Set()); // Reset the set for the next batch
      setAllImagesProcessed(false); // Reset the all images processed flag
    }
  };
  

  useEffect(() => {
    if (allImagesProcessed && isSendingData) {
      const delay = 12000; // 12 seconds in milliseconds
      const timer = setTimeout(() => {
        
        setIsSendButtonDisabled(false); 
      }, delay);
      sendTextToServer();

      return () => clearTimeout(timer);
    }
  }, [allImagesProcessed, isSendingData]);


  const cancelAction = () => {
    setIsPopUpVisible(false);
    setLoadingText('');
  };

  useEffect(() => {
    recognizeText();
  }, [Image]);

  return (
    <div>
      {isPopUpVisible && (
         <div className="d-block modal" tabIndex="-1">
         <div className="modal-dialog modal-dialog-centered">
           <div className="modal-content border-dark">
             <div className="modal-header">
               <h5 className="modal-title">Extracting Text</h5>
             </div>
             <div className="modal-body">
               <p className="text-center">
               <p>Extracted Text: {recognizedText}</p>
          <p>PROCESS ALMOST COMPLETE...CONTINUE?</p>
               </p>
             </div>
             <div className="modal-footer align-self-center">
               <button
                 type="button"
                 className="btn btn-danger"
                 onClick={cancelAction}
               >
                 Cancel
               </button>
               <button className="btn btn-success" onClick={sendTextToServer}>
                 Send
               </button>
             </div>
           </div>
         </div>
       </div>
      )}

      {setLoading && (
        <div>
          {isSendingData ? 'Sending data to the server...' : loadingText}
        </div>
      )}
    </div>
  );
}

export default TesseractOCR;