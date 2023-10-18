"use client";
import Aside_Faculty from "@/Components/Default fix/Aside_Faculty";
import Preset from "@/Components/Faculty/PresetListofTest";
import { useState } from "react";
function PresetPage() {
  const [clicked, setClicked] = useState(false);
  return (
    <>
      <div className="d-flex">
        <Aside_Faculty clicked={clicked} setClicked={setClicked}/>
        <Preset clicked={clicked} setClicked={setClicked}/>
      </div>
    </>
  );
}
export default PresetPage;
