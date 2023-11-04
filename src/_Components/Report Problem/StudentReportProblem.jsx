import { useTUPCID } from "@/app/Provider";
import axios from "axios";
import Link from "next/link";
import { useEffect } from "react";
import { useState } from "react";

function StudentReportProblem({ clicked, setClicked }) {
  const { TUPCID } = useTUPCID();
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  const fetchemail = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/StudentReportProblem?TUPCID=${TUPCID}`
      );
      setEmail(response.data[0].GSFEACC);
    } catch (err) {
      console.error(err);
    }
  };
  const sendMessage = async () => {
    const Information = {
      GSFEACC: email,
      MESSAGE: message,
    };
    try {
      const response = await axios.post(
        "http://localhost:3001/ReportProblem",
        Information
      );
      if (response.status === 200) {
        alert("DONE");
        setMessage("");
      } else {
        alert("TRY AGAIN");
      }
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    const fetching = setInterval(() => {
      fetchemail();
    }, 1000);
    return () => {
      clearInterval(fetching);
    };
  }, [TUPCID]);
  const handleclick = () => {
    setClicked(!clicked);
  };
  return (
    <main className="w-100 min-vh-100">
      <section className="container-fluid col-12 p-2 d-flex flex-column">
        <div className="d-flex align-items-center gap-2 mb-2">
          <i
            className="d-block d-sm-none bi bi-list fs-5 pe-auto custom-red px-2 rounded"
            onClick={handleclick}
          ></i>
          <Link href={{ pathname: "/Student" }}>
            <i className="bi bi-arrow-left fs-3 custom-black-color d-sm-block d-none"></i>
          </Link>
          <h2 className="m-0 w-100 text-sm-start text-center pe-3">
            REPORT PROBLEM
          </h2>
        </div>
        <form className="container border border-dark rounded d-flex flex-column col-xl-4 col-lg-5 col-md-6 col-sm-8 align-self-center align-items-center p-2 gap-2">
          <input
            value={email || ""}
            className="rounded border border-dark form-control"
            type="text"
            placeholder="Gsfe Account"
            disabled
            readOnly
          />
          <textarea
            onChange={(e) => setMessage(e.target.value)}
            className="rounded border border-dark form-control"
            placeholder="Message"
            rows={10}
          ></textarea>
          <button
            type="button"
            className="btn btn-outline-dark"
            onClick={sendMessage}
          >
            SEND
          </button>
        </form>
      </section>
    </main>
  );
}
export default StudentReportProblem;
