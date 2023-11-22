"use client"
import AdminDashboard from "@/_Components/Admin Page/Admin";
import AdminAside from "@/_Components/Default fix/Admin_aside";
import Authenticate from "@/app/Authentication";
import { useState } from "react";


function AdminPage() {
  const [clicked, setClicked] = useState(false);
  return (
    <>
      <div className="d-flex">
        <AdminAside clicked={clicked} setClicked={setClicked}/>
        <AdminDashboard clicked={clicked} setClicked={setClicked}/>
      </div>
    </>
  );
}
export default Authenticate(AdminPage);
