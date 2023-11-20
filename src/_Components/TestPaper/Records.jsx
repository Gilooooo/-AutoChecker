"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTUPCID } from "@/app/Provider";
import axios from "axios";

export default function Records() {
  const { TUPCID } = useTUPCID();
  const searchparams = useSearchParams();
  const testname = searchparams.get("testname");
  const sectionname = searchparams.get("sectionname");
  const uid = searchparams.get("uid");
  const semester = searchparams.get("semester");
  const [totalscore, settotatlscore] = useState([]);
  const [recordlist, setRecordList] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [updatedRecords, setUpdatedRecords] = useState([]);

  const fetchResult = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/Studentscores/${uid}`
      );

      if (response.status === 200) {
        const { studentlist } = response.data;
        setRecordList(studentlist);
      } else {
        console.error("Failed to fetch student scores");
      }
    } catch (error) {
      console.error("Error fetching student scores:", error);
    }
  };

  useEffect(() => {
    fetchResult();
  }, [uid]);

  const generateSheet = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/printstudentrecord/${uid}`,
        {
          responseType: "blob",
        }
      );

      if (response.status === 200) {
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const downloadLink = document.createElement("a");
        downloadLink.href = window.URL.createObjectURL(blob);
        downloadLink.setAttribute("download", "student_records.xlsx");
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        console.log(
          "Excel file generation initiated from backend for UID:",
          uid
        );
      } else {
        console.error("Failed to initiate Excel file generation from backend");
      }
    } catch (error) {
      console.error("Error while initiating Excel file generation:", error);
    }
  };

  const handleEditMode = () => {
    if (editMode) {
      setRecordList(updatedRecords);
      setEditMode(false);
    } else {
      setUpdatedRecords([...recordlist]);
      setEditMode(true);
    }
  };

  const handleUpdate = async (record) => {
    try {
      const { TUPCID, CORRECT, WRONG, MAXSCORE } = record;

      // Calculate the sum of CORRECT and WRONG
      const sumAnswers = parseInt(CORRECT) + parseInt(WRONG);

      if (sumAnswers !== parseInt(MAXSCORE)) {
        alert(
          "Sum of correct and wrong answers does not match MAXSCORE. Cannot update."
        );
        return; // Stop execution if the condition fails
      }

      const newTotalScore = parseInt(CORRECT);

      const response = await axios.put(
        `http://localhost:3001/updateTotalScore/${TUPCID}`,
        {
          CORRECT: newTotalScore,
          WRONG,
          TOTALSCORE: newTotalScore,
        }
      );

      if (response.status === 200) {
        fetchResult();
        setEditMode(false);
      } else {
        console.error("Failed to update CORRECT (TOTALSCORE)");
      }
    } catch (error) {
      console.error("Error updating CORRECT (TOTALSCORE):", error);
    }
  };

  return (
    <main className="min-vh-100 p-2 w-100">
      <section className="h-100">
        {/* Header and Navigation */}
        <div className="d-flex align-items-center">
          <a href="/Faculty">
            <i className="bi bi-arrow-left fs-3 custom-black-color "></i>
          </a>
          <h3 className="m-0">
            {sectionname}: {semester} - {testname} UID: {uid}
          </h3>
        </div>

        {/* Navigation */}
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
            <li className="m-0 fs-5">TESTPAPER</li>
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
            <li className="m-0 fs-5">ANSWER SHEET</li>
          </Link>
          <Link
            href={{
              pathname: "/Faculty/Test/AnswerKey",
              query: {
                testname: testname,
                uid: uid,
                sectionname: sectionname,
                semester: semester,
              },
            }}
            className="text-decoration-none link-dark"
          >
            <li className="m-0 fs-5">ANSWER KEY</li>
          </Link>

          <li className="m-0 fs-5 text-decoration-underline">RECORDS</li>
        </ul>

        {/* Content */}
        <section className="container col-md-8 col-12 col-xl-6 mt-3 py-4 col-10 px-3 border border-dark rounded h-75">
          <div className="border border-dark rounded h-100 overflow-auto">
            {/* Table for Student Records */}
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>STUDENT ID</th>
                  <th>STUDENT NAME</th>
                  <th>NUMBER OF CORRECT</th>
                  <th>NUMBER OF WRONG</th>
                  <th>TOTAL SCORE</th>
                </tr>
              </thead>
              <tbody>
                {recordlist.map((record, index) => (
                  <tr key={index}>
                    <td>{record.TUPCID}</td>
                    <td>
                      {record.SURNAME}, {record.FIRSTNAME}{" "}
                    </td>
                    <td>
                      {editMode ? (
                        <input
                          type="number"
                          value={record.CORRECT}
                          onChange={(e) => {
                            const updatedRecords = [...recordlist];
                            updatedRecords[index].CORRECT = e.target.value;
                            setRecordList(updatedRecords);
                          }}
                        />
                      ) : (
                        record.CORRECT
                      )}
                    </td>
                    <td>
                      {editMode ? (
                        <input
                          type="number"
                          value={record.WRONG}
                          onChange={(e) => {
                            const updatedRecords = [...recordlist];
                            updatedRecords[index].WRONG = e.target.value;
                            setRecordList(updatedRecords);
                          }}
                        />
                      ) : (
                        record.WRONG
                      )}
                    </td>
                    <td>
                      {record.TOTALSCORE} / {record.MAXSCORE}
                    </td>
                    <td>
                      {editMode ? (
                        <div>
                          <button onClick={() => handleUpdate(record)}>
                            Update
                          </button>
                          <button onClick={() => handleEditMode()}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditMode()}>
                          Update Scores
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <div className="text-center mt-3">
              <button onClick={generateSheet} className="btn btn-primary">
                GENERATE SHEET
              </button>
            </div>
        {/* End Content */}
      </section>
    </main>
  );
}
