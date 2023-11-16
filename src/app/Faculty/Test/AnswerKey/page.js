"use client";
import Aside_Faculty from "@/_Components/Default fix/Aside_Faculty";
import AnswerKey from "@/_Components/TestPaper/AnswerKey";
import { useState } from "react";

export default function AnswerSheetPage() {
  const [clicked, setClicked] = useState(false);
  return (
    <div className="d-flex">
      <Aside_Faculty clicked={clicked} setClicked={setClicked} />
      <AnswerKey />
    </div>
  );
}
