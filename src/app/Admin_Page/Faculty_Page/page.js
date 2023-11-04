"use client"
import Admin_Faculty from "@/_Components/Admin Page/Admin_Faculty";
import AdminAside from "@/_Components/Default fix/Admin_aside";
import { useState } from "react";

function Faculty_Page() {
  const [clicked, setClicked] = useState(false);
  return (
    <>
      <div className="d-flex">
        <AdminAside clicked={clicked} setClicked={setClicked}/>
        <Admin_Faculty clicked={clicked} setClicked={setClicked}/>
      </div>
    </>
  );
}
export default Faculty_Page;
