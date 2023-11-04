"use client";
import FacultyTestList from "@/_Components/Admin Page/Admin_FacultyTestlist";
import AdminAside from "@/_Components/Default fix/Admin_aside";
import { useState } from "react";

function TestList_Page() {
  const [clicked, setClicked] = useState(false);
  return (
    <>
      <div className="d-flex">
        <AdminAside clicked={clicked} setClicked={setClicked} />
        <FacultyTestList clicked={clicked} setClicked={setClicked}/>
      </div>
    </>
  );
}
export default TestList_Page;
