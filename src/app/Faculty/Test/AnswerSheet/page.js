"use client";
import Aside_Faculty from "@/_Components/Default fix/Aside_Faculty";
import AnswerSheet from "@/_Components/TestPaper/AnswerSheet";
import { useState } from "react";

export default function AnswerSheetPage() {
  const [clicked, setClicked] = useState(false);
  return (
    <div className="d-flex">
      <Aside_Faculty clicked={clicked} setClicked={setClicked}/>
      <AnswerSheet />
    </div>
  );
}
