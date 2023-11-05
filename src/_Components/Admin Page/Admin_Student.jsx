"use client";
import axios from "axios";
import { useEffect, useState } from "react";

function Admin_Student({ clicked, setClicked }) {
  const [student, setStudent] = useState([]);
  const [searchValue, setSearchValue] = useState("");

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

  const handleclick = () => {
    setClicked(!clicked);
  };
  const newStudentList = student.filter((lists) =>
    lists.FIRSTNAME.toLowerCase().includes(searchValue.toLowerCase())
  );
  return (
    <main className="w-100 p-0 vh-100 align-items-start">
      <section className="contatiner col-12 pe-2 text-sm-start text-center d-flex flex-column align-items-center justify-content-center">
        <div className="d-flex w-100 align-items-center">
          <div className="border-bottom border-dark py-1">
            <i
              className="d-block d-sm-none bi bi-list fs-5 custom-red px-2 rounded "
              onClick={handleclick}
            ></i>
          </div>
          <h2 className="px-2 w-100 border-bottom border-dark py-1 m-0">
            STUDENT
          </h2>
        </div>
        <div className="d-flex gap-2 justify-content-end align-items-center px-sm-5 px-xl-2 px-2 w-100 mt-2">
          <div className="d-flex">
            <input
              type="text"
              placeholder="FirstName Search"
              className="px-3 py-1 rounded border border-dark"
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <button className="btn btn-dark">AUDIT LOG</button>
          </div>
        </div>
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
                  {newStudentList.map((students, index) => (
                    <tr key={index}>
                      <td scope="col">{students.TUPCID}</td>
                      <td scope="col">{students.FIRSTNAME}</td>
                      <td scope="col"> {students.MIDDLENAME}</td>
                      <td scope="col"> {students.SURNAME}</td>
                      <td scope="col">
                        {" "}
                        {students.COURSE}-{students.SECTION}-{students.YEAR}
                      </td>
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
