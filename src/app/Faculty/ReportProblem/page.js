"use client";
import Aside_Faculty from "@/_Components/Default fix/Aside_Faculty";
import FacultyReportProblem from "@/_Components/Report Problem/FacultyReportProblem";
import { useState } from "react";

function FacultyReportProblemPage(){
    const [clicked, setClicked] = useState(false);
    return(
        <>
            <div className="d-flex">
                <Aside_Faculty setClicked={setClicked} clicked={clicked}/>
                <FacultyReportProblem  setClicked={setClicked} clicked={clicked}/>
            </div>
        </>
    )
};
export default FacultyReportProblemPage;