"use client";
import Aside_Faculty from "@/_Components/Default fix/Aside_Faculty";
import Records from "@/_Components/TestPaper/Records";
import Authenticate from "@/app/Authentication";
import { useState } from "react";

function RecordsPage() {
  const [clicked, setClicked] = useState(false);
  return (
    <div className="d-flex">
      <Aside_Faculty clicked={clicked} setClicked={setClicked}/>
      <Records />
    </div>
  );
}
export default Authenticate(RecordsPage)
