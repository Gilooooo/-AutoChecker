"use client";
import Aside_Faculty from "@/Components/Default fix/Aside_Faculty";
import ListOfTest from "@/Components/Faculty/ListofTest";
import { useState } from "react";

function ListOfTestPage() {
  const [clicked, setClicked] = useState(false);
  return (
    <>
      <div className="d-flex">
        <Aside_Faculty clicked={clicked} setClicked={setClicked}/>
        <ListOfTest clicked={clicked} setClicked={setClicked}/>
      </div>
    </>
  );
}
export default ListOfTestPage;
