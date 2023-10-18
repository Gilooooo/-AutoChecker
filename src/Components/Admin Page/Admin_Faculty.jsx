"use client";

import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";

function Admin_Faculty() {
  const [faculty, setFaculty] = useState([]);
  const fetchFaculty = async () => {
    try {
      const response = await axios.get("http://localhost:3001/Admin_Faculty");
      setFaculty(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetching = setInterval(() => {
      fetchFaculty();
    }, 2000);
    return () => {
      clearInterval(fetching);
    };
  }, []);

  return (
    <main className="w-100 p-0 vh-100">
      <section className="contatiner col-12 pe-2 text-sm-start text-center d-flex flex-column align-items-center justify-content-center">
        <h2 className="align-self-start px-2 w-100 border-bottom border-dark py-1">
          FACULTY
        </h2>
        <section className="container-fluid col-12">
          <div className="row p-0 pt-2">
            <div className="col-12 d-flex gap-3">
              <h5>FACULTY LIST</h5>
              <h5>TEST LIST</h5>
            </div>
            <div className="col-12 rounded pe-1 table-responsive">
              <table className="table-secondary table table-bordered border-secondary">
                <thead>
                  <tr>
                    <th scope="col">ID NO.</th>
                    <th scope="col">FIRSTNAME</th>
                    <th scope="col"> MIDDLENAME</th>
                    <th scope="col"> SURNAME</th>
                    <th scope="col"> SUBJECT DEPARTMENT</th>
                    <th scope="col"> UID</th>
                  </tr>
                </thead>
                <tbody>
                  {faculty.map((faculties, index) => (
                    <tr key={index}>
                      <td scope="col">{index+1}</td>
                      <td scope="col">{faculties.FIRSTNAME}</td>
                      <td scope="col"> {faculties.MIDDLENAME}</td>
                      <td scope="col"> {faculties.SURNAME}</td>
                      <td scope="col"> {faculties.SUBJECTDEPT}</td>
                      <td scope="col"> {faculties.uid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
export default Admin_Faculty;
