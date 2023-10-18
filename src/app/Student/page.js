"use client";
import Aside_Student from "@/Components/Default fix/Aside_Student";
import StudentTestList from "@/Components/Student/StudentTestList";
import { useState } from "react";
function StudentPage(){
    const [clicked, setClicked] = useState(false);
    return(
        <>
        <div className="d-flex">
            <Aside_Student clicked={clicked} setClicked={setClicked}/>
            <StudentTestList clicked={clicked} setClicked={setClicked}/>
        </div>
            
        </>
    )
}
export default StudentPage;