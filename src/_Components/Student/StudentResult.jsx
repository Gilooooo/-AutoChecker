"use client"

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Select from "react-select";
import { useTUPCID } from "@/app/Provider";
import axios from "axios";

function StudentResult({ clicked, setClicked }) {
  const searchparams = useSearchParams();
  const studentid = searchparams.get("studentid");
  const uid = searchparams.get("uidoftest");

  const [numberOfCorrect, setNumberOfCorrect] = useState(0);
  const [numberOfWrong, setNumberOfWrong] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [TUPCID, setTUPCID] = useState(""); 
  const [recordList, setRecordList] = useState([]);
  const [studentAnswerData, setStudentAnswerData] = useState([]);
  const [testData, setTestData] = useState([]);

  useEffect(() => {
    if (studentid) {
      fetchStudentname();
    }
  }, [studentid]);

  useEffect(() => {
    if (TUPCID && uid) {
      fetchResult();
    }
  }, [TUPCID, uid]);


  const fetchStudentname = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/Studentname2/${studentid}`
      );
      setTUPCID(response.data.TUPCID); // Set TUPCID from the API response
    } catch (err) {
      console.error(err);
    }
  };

  const fetchResult = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/myresult/${TUPCID}/${uid}`);

      if (response.status === 200) {
        const { resultlist } = response.data;
        setRecordList(resultlist);

        console.log("results: ", resultlist)
        const [result] = resultlist;
        if (result) {
          const { CORRECT, WRONG, TOTALSCORE, MAXSCORE } = result;

          setNumberOfCorrect(CORRECT || 0);
          setNumberOfWrong(WRONG || 0);
          setTotalScore(TOTALSCORE || 0);
          setMaxScore(MAXSCORE || 0);
        }
      } else {
        console.error("Failed to fetch student scores");
      }
    } catch (error) {
      console.error("Error fetching student scores:", error);
    }
  };

  const handleclick = () => {
    setClicked(!clicked);
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
        
      } else {
        console.error("Error fetching data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };


  const fetchStudentAnswers = async () => {
    try {
      let dataAvailable = false;

      while (!dataAvailable) {
        const response = await axios.get(
          `http://localhost:3001/getstudentanswers/${TUPCID}/${uid}`
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
              acc[type].push({ questionNumber, answer});
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
    if (TUPCID && uid) {
      fetchStudentAnswers();
    }
  }, [TUPCID, uid]);


  


useEffect(() => {
  if (uid) {
    fetchQuestionData();
  }
}, [uid]);

const renderAnswerKeyAndStudentAnswers = (type) => {
  const relevantTestData = testData.find((data) => data.type === type);
  const relevantStudentAnswerData = studentAnswerData.find(
    (data) => data.type === type
  );

  if (relevantTestData && relevantStudentAnswerData) {
    return (
      <>
        <td>
          {relevantTestData.questions.map((question, index) => (
            <div key={index}>{`${question.questionNumber}. ${question.answer}`}</div>
          ))}
        </td>
        <td>
          {relevantStudentAnswerData.answers.map((answer, idx) => (
            <div key={idx}>{`${answer.questionNumber}. ${answer.answer}`}</div>
          ))}
        </td>
      </>
    );
  }
  return null;
};

  return (
    <main className="w-100 min-vh-100">
      <section className="container-fluid col-12 p-2 d-flex flex-column">
        <div className="d-flex align-items-center gap-2 mb-2">
          <i
            className="d-block d-sm-none bi bi-list fs-5 pe-auto custom-red px-2 rounded"
            onClick={handleclick}
          ></i>
          <Link href={{ pathname: "/Student" }}>
            <i className="bi bi-arrow-left fs-3 custom-black-color d-sm-block d-none"></i>
          </Link>
          <h2 className="m-0 w-100 text-sm-start text-center pe-3">SUMMARY OF YOUR TEST</h2>
        </div>
        <div className="col-sm-8 align-self-sm-center d-flex flex-column">
              <span>Number of Correct Answers: {numberOfCorrect}</span>
              <span>Number of Wrong Answers: {numberOfWrong}</span>
              <span>Total Score:  {totalScore} / {maxScore}</span>
            </div>

            <div className="container border border-dark rounded d-flex flex-column col-sm-8 align-self-center align-items-center p-2 gap-2 table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr className="text-center">
                <th scope="col">Test Type</th>
                <th scope="col">Answer Key</th>
                <th scope="col">Student Answer</th>
              </tr>
            </thead>
            <tbody>
              {studentAnswerData.map((answerData, index) => (
                <tr key={index} className="text-center">
                  <td>{answerData.type}</td>
                  {renderAnswerKeyAndStudentAnswers(answerData.type)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default StudentResult;