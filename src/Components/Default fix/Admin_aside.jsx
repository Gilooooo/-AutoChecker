"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";

function AdminAside() {
  const asideRef = useRef(null);
  const params = useSearchParams();
  const UserName = params.get("Username");
  const [clicked, setClicked] = useState(false);
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
        <div className="h-100 d-flex flex-column justify-content-between align-items-center bg-danger py-2 px-2 ">
          <div>
            <i className="bi bi-list fs-5 pe-auto" onClick={handleclick}></i>
          </div>
          <div className="d-flex flex-column h-50 justify-content-center gap-2">
            <i className="bi bi-house fs-5"></i>
            <i className="bi bi-person fs-5"></i>
            <i className="bi bi-journal fs-5"></i>
          </div>
          <div className="d-flex flex-column gap-2">
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
            ? "vh-100 position-absolute custom-aside-admin2 bg-danger px-2 pe-3"
            : "vh-100 position-absolute custom-aside-admin1 bg-danger"
        }
      >
        <div className="h-100 d-flex flex-column justify-content-between align-items-center py-2">
          <div className="d-flex flex-column text-light text-center">
            <h5 className="m-0 text-wrap">{UserName}</h5>
          </div>
          <div className="d-flex flex-column justify-content-center text-light align-self-start gap-2 h-50 border-top border-bottom border-secondary w-100">
            <Link
             className="text-decoration-none link-light"
              href={{
                pathname: "/Admin_Page/Admin",
                query: `UserName=${UserName}`,
              }}
            >
              <div className="d-flex align-items-center gap-1">
                <i className="bi bi-house fs-5"></i>
                <h6 className="m-0">DASHBOARD</h6>
              </div>
            </Link>

            <Link
              className="text-decoration-none link-light"
              href={{
                pathname: "/Admin_Page/Student_Page",
                query: `UserName=${UserName}`,
              }}
            >
              <div className="d-flex align-items-center gap-1">
                <i className="bi bi-person fs-5"></i>
                <h6 className="m-0">STUDENTS</h6>
              </div>
            </Link>
            <Link
             className="text-decoration-none link-light"
              href={{
                pathname: "/Admin_Page/Faculty_Page",
                query: `UserName=${UserName}`,
              }}
            >
              <div className="d-flex align-items-center gap-1">
                <i className="bi bi-journal fs-5"></i>
                <h6 className="m-0">FACULTY</h6>
              </div>
            </Link>
          </div>
          <div className="d-flex flex-column text-light align-self-start px-2 gap-2">
            <div className="d-flex align-items-center gap-1">
              <i className="bi bi-gear fs-5"></i>
              <h6 className="m-0">SETTINGS</h6>
            </div>
            <div className="d-flex align-items-center gap-1">
              <i className="bi bi-exclamation-triangle-fill fs-5"></i>
              <h6 className="m-0">REPORT PROBLEM</h6>
            </div>
            <div className="d-flex align-items-center gap-1">
              <i className="bi bi-box-arrow-left fs-5"></i>
              <h6 className="m-0">LOGOUT</h6>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
export default AdminAside;
