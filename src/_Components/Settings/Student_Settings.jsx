import { useTUPCID } from "@/app/Provider";
import axios from "axios";
import Link from "next/link";
import { useEffect } from "react";
import { useState } from "react";

function StudentSettings({ clicked, setClicked }) {
  const { TUPCID } = useTUPCID();
  const [student, setStudents] = useState([]);
  const [edit, setEdit] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [gsfe, setGsfe] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [surName, setSurName] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [status, setStatus] = useState("");
  const [pass, setPass] = useState("");
  
  const fetchInfo = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/StudentSettings?Tupcid=${TUPCID}`
      );
      setStudents(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetching = setInterval(() => {
      if(!edit){
        return;
      }
      fetchInfo();
    }, 1000);
    return () => {
      clearInterval(fetching);
    };
  }, [TUPCID, edit]);

  const handleclick = () => {
    setClicked(!clicked);
  };
  return (
    <main className="w-100 min-vh-100">
      <section className="container-fluid col-12 p-2 d-flex flex-column">
        <div className="d-flex ">
          <i
            className="d-block d-sm-none bi bi-list fs-5 pe-auto custom-red px-2 rounded"
            onClick={handleclick}
          ></i>
          <Link href={{ pathname: "/Student" }}>
            <i className="bi bi-arrow-left fs-3 custom-black-color d-sm-block d-none"></i>
          </Link>
          <h2 className="m-0 w-100 text-sm-start text-center pe-3">SETTINGS</h2>
        </div>
        <h3 className="text-center mt-4">UPDATE PERSONAL INFO</h3>
        <form className="container border border-dark rounded d-flex flex-column col-xl-5 col-lg-6 col-md-8 align-items-center gap-1 py-3">
          <span className="align-self-end" onClick={() => setEdit(!edit)}>
            EDIT
          </span>
          <div className="row col-12 justify-content-center align-items-center px-sm-4 px-2">
            <div className="col-6 p-2 d-flex flex-column">
              <label className="p-0">TUPC ID</label>
              <input
                value={student[0]?.TUPCID || ""}
                type="text"
                className="border border-dark form-control rounded "
                disabled
              />
            </div>
            <div className="col-6 p-2 d-flex flex-column">
              <label className="p-0">GSFE ACCOUNT</label>
              <input
                value={student[0]?.GSFEACC || ""}
                type="text"
                className="border border-dark form-control rounded "
                disabled={edit}
              />
            </div>
            <div className="col-6 p-2 d-flex flex-column">
              <label className="p-0">FIRST NAME</label>
              <input
                value={student[0]?.FIRSTNAME || ""}
                type="text"
                className="border border-dark form-control rounded "
                disabled={edit}
              />
            </div>
            <div className="col-6 p-2 d-flex flex-column">
              <label className="p-0">COURSE</label>
              <select
                type="text"
                className="border border-dark form-control rounded "
                disabled={edit}
              >
                <option value={student[0]?.COURSE || ""} hidden selected>
                  {student[0]?.COURSE || ""}
                </option>
                <option value="BSCE">BSCE</option>
                <option value="BSEE">BSEE</option>
                <option value="BSME">BSME</option>
                <option value="BSIE ICT">BSIE ICT</option>
                <option value="BSIE IA">BSIE IA</option>
                <option value="BSIE HE">BSIE HE</option>
                <option value="BTTE CP">BTTE CP</option>
                <option value="BTTE EL">BTTE EL</option>
                <option value="BET AT">BET AT</option>
                <option value="BET CT">BET CT</option>
                <option value="BET COET">BET COET</option>
                <option value="BET ET">BET ET</option>
                <option value="BET ESET">BET ESET</option>
                <option value="BET MT">BET MT</option>
                <option value="BET PPT">BET PPT</option>
              </select>
            </div>
            <div className="col-6 p-2 d-flex flex-column">
              <label className="p-0">MIDDLE NAME</label>
              <input
                value={student[0]?.MIDDLENAME || ""}
                type="text"
                className="border border-dark form-control rounded "
                disabled={edit}
              />
            </div>
            <div className="col-6 p-2 d-flex flex-column">
              <label className="p-0">YEAR</label>
              <select
                className="border border-dark form-control rounded "
                disabled={edit}
              >
                <option value={student[0]?.YEAR || ""} selected hidden>
                  {student[0]?.YEAR || ""}
                </option>
                <option value="1ST">1ST</option>
                <option value="2ND">2ND</option>
                <option value="3RD">3RD</option>
                <option value="4TH">4TH</option>
              </select>
            </div>
            <div className="col-6 p-2 d-flex flex-column">
              <label className="p-0">SURNAME</label>
              <input
                value={student[0]?.SURNAME || ""}
                type="text"
                className="border border-dark form-control rounded "
                disabled={edit}
              />
            </div>
            <div className="col-6 p-2 d-flex flex-column">
              <label className="p-0">SECTION</label>
              <select
                className="border border-dark form-control rounded "
                disabled={edit}
              >
                <option value={student[0]?.SECTION || ""} selected hidden>
                  {student[0]?.SECTION || ""}
                </option>
                <option value="A">A</option>
                <option value="B">B</option>
              </select>
            </div>
            <div className="col-6 p-2 d-flex flex-column">
              <label className="p-0">STATUS</label>
              <input
                value={student[0]?.STATUS || ""}
                type="text"
                className="border border-dark form-control rounded "
                disabled={edit}
              />
            </div>
            <div className="col-6 p-2 d-flex flex-column">
              <label className="p-0">PASSWORD</label>
              <input
                value={student[0]?.PASSWORD || ""}
                type="text"
                className="border border-dark form-control rounded "
                disabled={edit}
              />
            </div>
          </div>
          <button className="btn btn-outline-dark" type="submit">
            Save
          </button>
        </form>
      </section>
    </main>
  );
}
export default StudentSettings;
