import { useTUPCID } from "@/app/Provider";
import axios from "axios";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function Aside_Faculty({ clicked, setClicked }) {
  const [information, setInfo] = useState([]);
  const { TUPCID } = useTUPCID();
  const asideRef = useRef(null);

  const fetchAside = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/FacultyAside?UidProf=${TUPCID}`
      );
      response.data.map((info) => {
        setInfo({
          FirstName: info.FIRSTNAME,
          MiddleName: info.MIDDLENAME,
          SurName: info.SURNAME,
          Tupcid: info.TUPCID,
          SubjectDept: info.SUBJECTDEPT,
        });
      });
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    const fetching = setInterval(() => {
      fetchAside();
    }, 1000);
    return () => {
      clearInterval(fetching);
    };
  }, [TUPCID]);

  const handleclick = () => {
    setClicked(!clicked);
  };

  const handleOutsideClick = (e) => {
    if (clicked && asideRef.current && !asideRef.current.contains(e.target)) {
      setClicked(false);
    }
  };
  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [clicked]);

  return (
    <>
      <aside className="min-vh-100 bg-danger position-relative">
        <div className="h-100 d-sm-flex d-none flex-column justify-content-between align-items-center bg-danger py-1 px-2 ">
          <div>
            <i className="bi bi-list fs-5 pe-auto" onClick={handleclick}></i>
          </div>
          <div className="d-flex flex-column">
            <i className="bi bi-gear fs-5"></i>
            <i className="bi bi-exclamation-triangle-fill fs-5"></i>
            <i className="bi bi-box-arrow-left fs-5"></i>
          </div>
        </div>
      </aside>
      <aside
        ref={asideRef}
        className={
          clicked
            ? "vh-100 position-fixed custom-aside-admin2 bg-danger px-2 pe-3"
            : "vh-100 position-fixed custom-aside-admin1 bg-danger"
        }
      >
        <div className="h-100 d-flex flex-column justify-content-between align-items-center py-2 ">
          <div className="d-flex flex-column text-light text-center text-dark">
            <small className="text-wrap">
              {information.FirstName} {information.MiddleName} {information.SurName}
            </small>
            <small>{information.Tupcid}</small>
            <small>{information.SubjectDept}</small>
          </div>
          <div className="d-flex flex-column text-light align-self-start px-2 text-dark">
            <div className="d-flex align-items-center gap-1 ">
              <i className="bi bi-gear fs-5"></i>
              <small>SETTINGS</small>
            </div>
            <div className="d-flex align-items-center gap-1">
              <i className="bi bi-exclamation-triangle-fill fs-5"></i>
              <small>REPORT PROBLEM</small>
            </div>
            <div className="d-flex align-items-center gap-1">
              <i className="bi bi-box-arrow-left fs-5 "></i>
              <Link
                href={{ pathname: "/Login" }}
                className="text-decoration-none link-dark"
              >
                <small>LOGOUT</small>
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
export default Aside_Faculty;
