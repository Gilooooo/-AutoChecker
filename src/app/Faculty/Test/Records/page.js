"use client";
import Aside_Faculty from "@/_Components/Default fix/Aside_Faculty";
import Records from "@/_Components/TestPaper/Records";
import { useState } from "react";

export default function RecordsPage() {
  const [clicked, setClicked] = useState(false);
  return (
    <div className="d-flex">
      <Aside_Faculty clicked={clicked} setClicked={setClicked}/>
      <Records />
    </div>
  );
}
