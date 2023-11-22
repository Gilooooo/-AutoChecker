"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useTUPCID } from "@/app/Provider";
import Link from "next/link";
import TesseractOCR from "./camera/tesseract";
import TextLocalization from "./camera/textLocalization";
import TextLocalization2 from "./camera/textlocalizationword";
import ImageInput from "@/app/Faculty/Test/opencv/page";



export default function AnswerKey() {
  const { TUPCID } = useTUPCID();
  const searchparams = useSearchParams();
  const testname = searchparams.get("testname");
  const sectionname = searchparams.get("sectionname");
  const uid = searchparams.get("uid");
  const subject = searchparams.get("subject");
  const semester = searchparams.get("semester");
  const [testData, setTestData] = useState([]);
  const [testType, setTestType] = useState("No Test Paper Yet");
  const [ImageData, setImageData] = useState(null);
  const [processedImageData, setProcessedImageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [studentAnswerData, setStudentAnswerData] = useState([]);
  const [studentid, setStudentId] = useState(null);
  const [uidfromtestpaper, setuidfromtestpaper] = useState(null);
  const [processedImageCount, setProcessedImageCount] = useState(0);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [totalScore2, setTotalScore2] = useState(0);
  const [Wrong, setWrong] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [students, setStudents] = useState([]);
  const [totalScoreValue, setTotalScoreValue] = useState(0); 



  useEffect(() => {
    // Update totalScore with the value obtained from totalScoreValue state
    setTotalScore(totalScoreValue);

  }, [totalScoreValue]);

  const updateStudentId = (newStudentId) => {
    setStudentId(newStudentId);
  };

  const handleUIDDetected = (detectedUID) => {
    setuidfromtestpaper(detectedUID);
  };

  const handleImageSelected = (retrievedImages) => {
    setImageData(retrievedImages);
    setProcessedImageData(retrievedImages);
    setProcessedImageCount(retrievedImages.length);
  };

  const toRoman = (num) => {
    const romanNumerals = [
      "I",
      "II",
      "III",
      "IV",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX",
      "X",
    ];
    return romanNumerals[num] || num;
  };

  const fetchQuestionData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/getquestionstypeandnumberandanswer/${uid}`
      );
      if (response.status === 200) {
        const {
          questionNumbers,
          questionTypes,
          answers,
          score,
          totalScoreValue
        } = response.data;

        const organizedData = questionTypes.reduce((acc, type, index) => {
          if (type && answers[index]) {
            const questionNumber = questionNumbers[index];
            const answer = answers[index];
            const questionScore = score[index];

            if (!acc[type]) {
              acc[type] = {
                questions: [],
                score: 0,
                TotalScore: 0,
              };
            }

            acc[type].questions.push({ questionNumber, answer, score: questionScore });
            acc[type].score += questionScore || 0;
          }
          return acc;
        }, {});

        const organizedDataArray = Object.entries(organizedData).map(([type, data]) => ({
          type,
          questions: data.questions,
          score: data.score,
        }));

        setTestData(organizedDataArray);
        setTotalScoreValue(totalScoreValue);

      } else {
        console.error("Error fetching data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchQuestionData();
  }, []);



  const fetchStudentAnswers = async () => {
    try {
      let dataAvailable = false;

      while (!dataAvailable) {
        const response = await axios.get(
          `http://localhost:3001/getstudentanswers/${studentid}/${uidfromtestpaper}`
        );

        if (response.status === 200) {
          const {
            testType: fetchedTestType,
            questionNumbers,
            questionTypes,
            answers,
          } = response.data;

          const filteredData = questionTypes.reduce((acc, type, index) => {
            if (type && answers[index]) {
              const questionNumber = questionNumbers[index];
              const answer = answers[index];


              if (!acc[type]) {
                acc[type] = [];
              }
              acc[type].push({ questionNumber, answer });
            }
            return acc;
          }, {});

          const organizedDataArray2 = Object.entries(filteredData).map(
            ([type, data]) => ({
              type,
              answers: data,
            })
          );

          setStudentAnswerData(organizedDataArray2);
          setTestType(fetchedTestType || "No Test Paper Created Yet");
          dataAvailable = true;
        } else {
          console.error("Error fetching student answers");
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error("Error fetching student answers:", error);
    }
  };


  // Inside the useEffect that calculates totalScore2
  useEffect(() => {
    const calculateTotalScore2 = () => {
      let totalScore2 = 0;
  
      studentAnswerData.forEach((answerSection, index) => {
        answerSection.answers.forEach((answer) => {
          const matchingTestSection = testData[index];
          if (matchingTestSection) {
            const matchingQuestion = matchingTestSection.questions.find(
              (question) => question.questionNumber === answer.questionNumber
            );
  
            if (matchingQuestion && matchingQuestion.answer === answer.answer) {
              totalScore2 += matchingQuestion.score;
            }
          }
        });
      });
  
      setTotalScore2(totalScore2);
  
      const wrongAnswers = totalScoreValue - totalScore2;
  
      setWrong(wrongAnswers);
  
      console.log("Total Score 2:", totalScore2);
      console.log("Wrong Answers:", wrongAnswers);
    };
  
    calculateTotalScore2();
  }, [studentAnswerData, testData, totalScoreValue]);
  
  


  useEffect(() => {
    let timerId;

    const fetchDataWithDelay = async () => {
      timerId = setTimeout(async () => {
        await fetchStudentAnswers();
        setShowPopup(true);
      }, 20000);
    };

    if (studentid !== null && uidfromtestpaper !== null) {
      fetchDataWithDelay();
    }

    return () => {
      clearTimeout(timerId);
    };
  }, [studentid, uidfromtestpaper]);


  const sendStudentData = async () => {
    try {
      // Fetch student answers from the backend endpoint
      const response = await axios.put(
        `http://localhost:3001/updatestudentanswers/${studentid}/${uidfromtestpaper}`
      );

      const { data: { updatedAnswers } } = response;
      console.log("updated answers:", updatedAnswers)

      const absoluteWrong = Math.abs(Wrong);


      // Use the updated answers to post to another endpoint if needed
      const sendData = {
        TUPCID: studentid,
        UID: uidfromtestpaper,
        results: updatedAnswers,
        correct: totalScore2,
        wrong: absoluteWrong,
        totalscore2: totalScore2,
        maxscore: totalScore
      };

      const resultResponse = await axios.post('http://localhost:3001/sendanswertoresult', sendData);

        // Resetting states or clearing values after sending data
    setStudentId(null);
    setStudents([]);
    setTotalScore(0);
    setStudentAnswerData([]);
    setShowPopup(false);
  } catch (error) {
    console.error('Error sending data:', error);
  }
};



  const fetchStudentname = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/Studentname/${studentid}`
      );
      setStudents(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (studentid) {
      fetchStudentname();
    }
  }, [studentid]);

  return (
    <main className="min-vh-100 w-100 p-2">
      <section>
        <div className="d-flex align-items-center">
          <Link href="/Faculty/ListOfTest">
            <i className="bi bi-arrow-left fs-3 custom-black-color "></i>
          </Link>

          <h3 className="m-0">
            {sectionname}: {subject} - {semester}: {testname} UID: {uid}
          </h3>
        </div>
        <ul className="d-flex flex-wrap justify-content-around mt-3 list-unstyled">
          <Link
            href={{
              pathname: "/Faculty/Test/TestPaper",
              query: {
                testname: testname,
                uid: uid,
                sectionname: sectionname,
                semester: semester,
                subject: subject
              },
            }}
            className="text-decoration-none link-dark"
          >
            <li className="m-0 fs-5">TEST PAPER</li>
          </Link>
          <Link
            href={{
              pathname: "/Faculty/Test/AnswerSheet",
              query: {
                testname: testname,
                uid: uid,
                sectionname: sectionname,
                semester: semester,
                subject: subject
              },
            }}
            className="text-decoration-none link-dark"
          >
            <li className="m-0 fs-5 text-decoration-none">ANSWER SHEET</li>
          </Link>
          <li className="m-0 fs-5">ANSWER KEY</li>
          <Link
            href={{
              pathname: "/Faculty/Test/Records",
              query: {
                testname: testname,
                uid: uid,
                sectionname: sectionname,
                semester: semester,
                subject: subject
              },
            }}
            className="text-decoration-none link-dark"
          >
            <li className="m-0 fs-5">RECORDS</li>
          </Link>
        </ul>
        <section className="container-sm mt-5 col-xl-6 py-3 px-4 border border-dark rounded">
          <form className="row">
            <div className="col-6">
              <h5 className="m-0 text-center align-self-center">TEST</h5>
              <div className="col-12 mt-4">
                <p>Total Score: {totalScore} POINTS </p>
              </div>

              {testData.map((testSection, index) => (
                <div key={index}>
                  <h6 className="col-12 mt-4">{`TEST ${toRoman(index)}`}</h6>
                  <ul className="col-6 list-unstyled">
                    {testSection.questions.map((question, qIndex) => (
                      <li key={qIndex}>
                        {`${question.questionNumber}. ${question.answer} `}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

            </div>
            <div className="col-6">
              <h5 className="m-0 text-center align-self-center">
                TUPCID: {studentid}{" "}
              </h5>
              <h5 className="m-0 text-center align-self-center">
                Student Name: {students.FIRSTNAME} {students.MIDDLENAME} {students.SURNAME}
              </h5>
              <h5 className="m-0 text-center align-self-center">
                STUDENT ANSWER
              </h5>
              <p>Total Score: {totalScore2} POINTS </p>
              {studentAnswerData.map((answerSection, index) => (
                <div key={index}>
                  <h6 className="col-12 mt-4">{`TEST ${toRoman(index)}`}</h6>
                  <ul className="col-6 list-unstyled">
                    {answerSection.answers.map((answer, aIndex) => {
                      // Find the corresponding question in testData for scoring logic
                      const matchingTestSection = testData[index];
                      const matchingQuestion = matchingTestSection?.questions.find(
                        (question) => question.questionNumber === answer.questionNumber
                      );


                      const scoreOfStudent = matchingQuestion?.answer === answer.answer ? matchingQuestion.score : 0;
                      const scoreText = scoreOfStudent === 0 ? "wrong" : "check";

                      return (
                        <li key={aIndex}>
                          {`${answer.questionNumber}. ${answer.answer} - ${scoreText}`}
                        </li>
                      );

                    })}

                  </ul>
                </div>
              ))}

            </div>

          </form>
          <ImageInput onImageSelected={handleImageSelected} />
          <TextLocalization imageData={processedImageData} />
          <TextLocalization2 imageData={processedImageData} />
          <TesseractOCR
            Image={processedImageData}
            UIDintestpaper={uid}
            setLoading={setLoading}
            setProgress={setProgress}
            updateStudentId={updateStudentId}
            onUIDDetected={handleUIDDetected}
          />
          {showPopup && (
            <div className="d-block modal" tabIndex="-1">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-dark">
                  <div className="modal-header">
                    <h5 className="modal-title">SUMMARY</h5>
                  </div>
                  <div className="modal-body">
                    <p className="text-center">
                      <p>Student Name: {students.FIRSTNAME} {students.MIDDLENAME} {students.SURNAME}</p>
                      <p>Section Name: {sectionname}</p>
                      <p>Test Name: {testname}</p>
                      <p>Total Score: {totalScore2} / {totalScore}</p>
                    </p>
                  </div>
                  <div className="modal-footer align-self-center">
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => setShowPopup(!showPopup)}
                    >
                      Cancel
                    </button>
                    <button className="btn btn-success" onClick={sendStudentData}>
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </section>

    </main>
  );
}