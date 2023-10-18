"use client";
import Aside_Faculty from "@/Components/Default fix/Aside_Faculty";
import Sections from "@/Components/Faculty/Sections";
import { useState } from "react";
function SectionPage() {
  const [clicked, setClicked] = useState(false);
  return (
    <>
      <div className="d-flex">
        <Aside_Faculty clicked={clicked} setClicked={setClicked}/>
        <Sections clicked={clicked} setClicked={setClicked}/>
      </div>
    </>
  );
}
export default SectionPage;
