"use client";

import { useTUPCID } from "@/app/Provider";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

function AdminLogin() {
  const {setTUPCID} = useTUPCID();
  const [accNumber, setAccNumber] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [showPassword, setShowpassword] = useState(false);

  const login = async () => {
    const loginData = {
      Account_Number: accNumber,
      Password: password,
    };
    try {
      const response = await axios.post(
        "http://localhost:3001/AdminLogin",
        loginData
      );
      if(response.status === 200){
        setTUPCID(response.data.Uid_Account);
        router.push(`/Admin_Page/Admin?Username`);     
      }else if(response.status === 204){
        console.log("Account not found")
      } 
    } catch (err) {
      console.error(err)
    }
  };
  return (
    <main className="vh-100 d-flex justify-content-center align-items-center ">
      <section className="container col-xl-4 col-lg-6 col-md-7 col-11 d-flex flex-column border border-dark rounded px-0 pt-5 pb-4 gap-2 ">
        <h4 className="text-center">ADMIN LOGIN</h4>
        <form className="container row text-center align-self-center justify-content-center gap-3 p-0">
          <div className="row justify-content-center gap-1">
            <p className="col-sm-4 m-0 align-self-center">Account Number</p>
            <input
              onChange={(e) => setAccNumber(e.target.value)}
              type="text"
              className="col-sm-6 col-11 px-3 py-1 rounded border-dark border text-center"
            />
          </div>
          <div className="row justify-content-center gap-1 position-relative align-items-center">
            <p className="col-sm-4 m-0 align-self-center">Password</p>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text":"password"}
              className="col-sm-6 col-11 px-3 py-1 rounded border-dark border text-center position-relative"
            />
             {showPassword ? (
                <i
                onClick={() => setShowpassword(!showPassword)}
                  className="bi bi-eye-slash custom-black-color fs-4 position-absolute custom-eye"
                  style={{ width: "36px" }}
                ></i>
              ) : (
                <i
                  onClick={() => setShowpassword(!showPassword)}
                  className="bi bi-eye custom-black-color fs-4 position-absolute custom-eye"
                  style={{ width: "36px"}}
                ></i>
              )}
          </div>
          <div className="mt-2 p-0">
            <button
              onClick={login}
              type="button"
              className="align-self-center col-sm-3 col-4 btn btn-outline-dark rounded mb-3"
            >
              Login
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
export default AdminLogin;
