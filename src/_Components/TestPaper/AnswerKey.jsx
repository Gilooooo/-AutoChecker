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

        const organizedDataArray = Object.entries(filteredData).map(
          ([type, data]) => ({
            type,
            questions: data,
          })
        );

        setTestData(organizedDataArray);
        setTestType(fetchedTestType || "No Test Paper Created Yet");
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

  useEffect(() => {
    let timerId;

    const fetchDataWithDelay = async () => {
      timerId = setTimeout(async () => {
        await fetchStudentAnswers();
      }, 20000);
    };

    if (studentid !== null && uidfromtestpaper !== null) {
      fetchDataWithDelay();
    }

    return () => {
      clearTimeout(timerId);
    };
  }, [studentid, uidfromtestpaper]);

  useEffect(() => {
    // Function to fetch comparison results
    const fetchComparisonResults = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/compareanswers/${uidfromtestpaper}`
        );

        if (response.status === 200) {
          setComparisonResults(response.data);
          alert("see result", response.data);
        } else {
          console.error("Error fetching comparison results");
        }
      } catch (error) {
        console.error("Error fetching comparison results:", error);
      }
    };

    if (uidfromtestpaper !== null && studentAnswerData !== null) {
      fetchComparisonResults();
    }
  }, [uidfromtestpaper, studentAnswerData]);

  return (
    <main className="min-vh-100 w-100 p-2">
      <section>
        <div className="d-flex align-items-center">
          <a className="align-self-center" href="/Faculty/ListOfTest">
            <i className="bi bi-arrow-left fs-3 custom-black-color "></i>
          </a>

          <h3 className="m-0">
            {sectionname}: {semester} - {testname} UID: {uid}
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
              {testData.map((testSection, index) => (
                <div key={index}>
                  <h6 className="col-12 mt-4">{`TEST ${toRoman(index)}`}</h6>
                  <ul className="col-6 list-unstyled">
                    {testSection.questions.map((question, qIndex) => (
                      <li key={qIndex}>
                        {`${question.questionNumber}. ${question.answer}`}
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
                STUDENT ANSWER
              </h5>
              {studentAnswerData.map((answerSection, index) => (
                <div key={index}>
                  <h6 className="col-12 mt-4">{`TEST ${toRoman(index)}`}</h6>
                  <ul className="col-6 list-unstyled">
                    {answerSection.answers.map((answer, aIndex) => (
                      <li key={aIndex}>
                        {`${answer.questionNumber}. ${answer.answer} `}
                      </li>
                    ))}
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
        </section>
      </section>
    </main>
  );
}
