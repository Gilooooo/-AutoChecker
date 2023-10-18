"use client";
import axios from "axios";
import { useEffect, useState } from "react";

function Admin_Student() {
  const [student, setStudent] = useState([]);

  const fetchStudent = async () => {
    try {
      const response = await axios.get("http://localhost:3001/Admin_Students");
      setStudent(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetching = setInterval(() => {
      fetchStudent();
    }, 2000);
    return () => {
      clearInterval(fetching);
    };
  }, []);

  return (
    <main className="w-100 p-0 vh-100 align-items-start">
      <section className="contatiner col-12 pe-2 text-sm-start text-center d-flex flex-column align-items-center justify-content-center">
        <h2 className="align-self-start px-2 w-100 border-bottom border-dark py-1">
          STUDENTS
        </h2>
        <section className="container-fluid col-12">
          <div className="row p-0 pt-2">
            <div className="col-12 rounded pe-1 table-responsive">
              <table className="table-secondary table table-bordered border-secondary">
                <thead>
                  <tr>
                    <th scope="col">ID NO.</th>
                    <th scope="col">FIRSTNAME</th>
                    <th scope="col"> MIDDLENAME</th>
                    <th scope="col"> SURNAME</th>
                    <th scope="col"> COURSE, SECTION & YEAR</th>
                    <th scope="col"> UID</th>
                  </tr>
                </thead>
                <tbody>
                  {student.map((students, index) => (
                    <tr key={index}>
                      <td scope="col">{students.TUPCID}</td>
                      <td scope="col">{students.FIRSTNAME}</td>
                      <td scope="col"> {students.MIDDLENAME}</td>
                      <td scope="col"> {students.SURNAME}</td>
                      <td scope="col"> {students.COURSE}-{students.SECTION}-{students.YEAR}</td>
                      <td scope="col"> {students.uid}</td>
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
export default Admin_Student;
