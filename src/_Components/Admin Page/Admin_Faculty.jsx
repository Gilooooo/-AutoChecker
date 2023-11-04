import axios from "axios";
import Link from "next/link";
import { useEffect } from "react";
import { useState } from "react";

function Admin_Faculty({ clicked, setClicked }) {
  const [faculty, setFaculty] = useState([]);
  const [searchValue, setSearchValue] = useState("");
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

  const handleclick = () => {
    setClicked(!clicked);
  };

  const newFacultyList = faculty.filter((faculties) =>
  faculties.FIRSTNAME.toLowerCase().includes(searchValue.toLowerCase())
);

  return (
    <main className="w-100 p-0 vh-100">
      <section className="contatiner col-12 pe-2 text-sm-start text-center d-flex flex-column align-items-center justify-content-center">
        <div className="d-flex w-100 align-items-center">
          <div className="border-bottom border-dark py-1">
            <i
              className="d-block d-sm-none bi bi-list fs-5 custom-red px-2 rounded "
              onClick={handleclick}
            ></i>
          </div>

          <h2 className="px-2 w-100 border-bottom border-dark py-1 m-0">
            FACULTY
          </h2>
        </div>
        <section className="container-fluid col-12">
          <div className="row p-0 pt-2">
            <div className="col-12 d-flex gap-3">
              <h3 className="text-decoration-underline">FACULTY LIST</h3>
              <Link href={"/Admin_Page/Faculty_Page/Test_List"} className="text-decoration-none link-dark">
                <h3>TEST LIST</h3>
              </Link>
            </div>
            <div className="d-flex gap-2 justify-content-end align-items-center px-sm-5 px-xl-2 px-2">
              <div className="d-flex">
                <input
                  type="text"
                  placeholder="FirstName Search"
                  className="px-3 py-1 rounded border border-dark"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                <button className="btn btn-dark">AUDIT LOG</button>
              </div>
            </div>
            <div className="pe-2 table-responsive mt-2">
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
                  {newFacultyList.map((faculties, index) => (
                    <tr key={index}>
                      <td scope="col">{index + 1}</td>
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
