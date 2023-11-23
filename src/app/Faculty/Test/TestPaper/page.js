"use client";

import Aside_Faculty from "@/_Components/Default fix/Aside_Faculty";
import Warning from "@/_Components/Default fix/warning";
import TestPaper from "@/_Components/TestPaper/TestPaper";
import Authenticate from "@/app/Authentication";
import { useState } from "react";

function DashboardPage() {
  const [clicked, setClicked] = useState(false);
  return (
    <>
      <div className="d-flex">
        <Aside_Faculty clicked={clicked} setClicked={setClicked} />
        <TestPaper />
      </div>
      <Warning />
    </>
  );
}
export default Authenticate(DashboardPage);
