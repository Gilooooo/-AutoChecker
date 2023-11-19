"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Select from "react-select";
import { useTUPCID } from "@/app/Provider";
import axios from "axios";

export default function Records() {
  const { TUPCID } = useTUPCID();
  const searchparams = useSearchParams();
  const testname = searchparams.get("testname");
  const sectionname = searchparams.get("sectionname");
  const uid = searchparams.get("uid");
  const semester = searchparams.get("semester");
  const [studentid, setstudentid] = useState([]);
  const [totalscore, settotatlscore] = useState([]);
  const[recordlist, setRecordList] = useState([]);

  const fetchResult = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/Studentscores/${uid}`);

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

  const generateSheet = () => {
    // Logic to generate the sheet goes here
    console.log("Sheet generation logic goes here");
  };

  return (
    <main className="min-vh-100 p-2 w-100">
      <section className="h-100">
        {/* Header and Navigation */}
        <div className="d-flex align-items-center">
          <a href="/Faculty">
            <i className="bi bi-arrow-left fs-3 custom-black-color "></i>
          </a>
          {sectionname}: {semester} - {testname} UID: {uid}
        </div>
        
        {/* Navigation */}
        <ul className="d-flex flex-wrap justify-content-around mt-3 list-unstyled">
        <Link href={{
              pathname: "/Faculty/Test/TestPaper",
              query: {
                testname: testname,
                uid: uid,
                sectionname: sectionname,
                semester: semester,
                
              },
            }} className="text-decoration-none link-dark">
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
          <Link href={{
              pathname: "/Faculty/Test/AnswerKey",
              query: {
                testname: testname,
                uid: uid,
                sectionname: sectionname,
                semester: semester,
                
              },
            }} className="text-decoration-none link-dark">
            <li className="m-0 fs-5">ANSWER KEY</li>
          </Link>
         
            <li className="m-0 fs-5 text-decoration-underline">RECORDS</li>
          
        </ul>
        
        {/* Content */}
        <section className="container col-12 col-xl-7 mt-5 py-4 col-10 px-3 border border-dark rounded h-75">
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
                    <td>{record.SURNAME}, {record.FIRSTNAME} </td>
                    <td>{record.correct}</td>
                    <td>{record.wrong}</td>
                    <td>{record.TOTALSCORE}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-center mt-3">
            <button onClick={generateSheet} className="btn btn-primary">
              GENERATE SHEET
            </button>
          </div>
          </div>
          
        </section>
        {/* End Content */}
      </section>
    </main>
  );
}