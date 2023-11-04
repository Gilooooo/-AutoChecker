"use client"
import Aside_Faculty from "@/_Components/Default fix/Aside_Faculty";
import FacultySettings from "@/_Components/Settings/Faculty_Settings";
import { useState } from "react";
function SettingsPage() {
  const [clicked, setClicked] = useState(false);
  return (
    <>
      <div className="d-flex">
        <Aside_Faculty setClicked={setClicked} clicked={clicked}/>
        <FacultySettings setClicked={setClicked} clicked={clicked}/>
      </div>
    </>
  );
}
export default SettingsPage;
