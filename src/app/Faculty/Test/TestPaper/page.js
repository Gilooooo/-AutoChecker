"use client";

import Aside_Faculty from "@/_Components/Default fix/Aside_Faculty";
import TestPaper from "@/_Components/TestPaper/TestPaper";
import { useState } from "react";

export default function DashboardPage() {
  const [clicked, setClicked] = useState(false);
  return (
    <div className="d-flex">
      <Aside_Faculty clicked={clicked} setClicked={setClicked} />
      <TestPaper />
    </div>
  );
}
