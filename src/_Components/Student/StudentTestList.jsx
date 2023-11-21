import { useTUPCID } from "@/app/Provider";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

function StudentTestList({ clicked, setClicked }) {
  const { TUPCID } = useTUPCID();
  const [testList, setTestList] = useState([]);
  const [uidSection, setUidSection] = useState("");
  const [message, setMessage] = useState("");
  const [publishedtest, setPublishedTest] = useState([]);
  const [testNameMap, setTestNameMap] = useState({});
  const [studentScores, setStudentScores] = useState([]);
  const [dropdown, setDropdown] = useState(false);

  const Join = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/StudentTestList?uidsection=${uidSection}`
      );
      if (response.status === 200) {
        setMessage("");
        try {
          const response1 = await axios.put(
            `http://localhost:3001/StudentTestList?uidStudent=${TUPCID}`,
            response.data[0]
          );
          if (response1.status === 200) {
            console.log("Done");
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        setMessage("Section doesn't exist or wrong uid");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchingStudentTest = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/StudentSectionList?uidStudent=${TUPCID}`
      );

      const enrolledSections = response.data.enrolledSections || [];
      setTestList(enrolledSections);
      console.log("data i received:  ", enrolledSections);

      // Create testNameMap based on Uid_Test and TestName from the backend
      const testNameRows = response.data.testNameMap || [];
      const map = {};
      testNameRows.forEach((row) => {
        map[row.Uid_Test] = row.TestName;
      });

      console.log("testname row: ", testNameRows);
      console.log("testnamemap: ", map);

      setTestNameMap(testNameRows);

      const { studentScores } = response.data;
      console.log("Student Scores for test", studentScores);
      setStudentScores(studentScores || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetching = setInterval(() => {
      fetchingStudentTest();
    }, 2000);
    return () => {
      clearInterval(fetching);
    };
  }, [TUPCID]);

  const handleclick = () => {
    setClicked(!clicked);
  };

  return (
    <main className="w-100 min-vh-100 d-flex justify-content-center">
      <section className="contatiner col-12 text-sm-start text-center d-flex flex-column align-items-start p-2">
        <div className="d-flex gap-2 align-items-center mb-3 w-100">
          <i
            className="d-block d-sm-none bi bi-list fs-5 pe-auto custom-red px-2 rounded"
            onClick={handleclick}
          ></i>
          <h2 className="m-0 w-100 text-center text-sm-start pe-3">STUDENT</h2>
        </div>
        <div className="d-flex justify-content-end w-100 ">
          <small onClick={() => console.log(publishedtest)}>Sort by:</small>
        </div>
        <div className="d-flex justify-content-between w-100 position-relative">
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-dark"
              data-bs-toggle="modal"
              data-bs-target="#Jointest"
            >
              + JOIN
            </button>
            {/* Start Modal Add Test */}
            <div
              className="modal fade"
              id="Jointest"
              tabIndex="-1"
              aria-labelledby="JointestLabel"
              aria-hidden="true"
              data-bs-backdrop="static"
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header position-relative justify-content-center">
                    <h1 className="modal-title fs-5" id="JointestLabel">
                      JOIN SECTION
                    </h1>
                    <button
                      type="button"
                      className="btn-close m-0 position-absolute end-0 pe-4"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body px-5 text-center row justify-content-center">
                    <span className="text-secondary mb-2">
                      ENTER THE CODE GIVEN BY A TEACHER OR A PROFESSOR
                    </span>
                    <label htmlFor="joinCode">JOIN CODE</label>
                    <input
                      value={uidSection}
                      onChange={(e) => setUidSection(e.target.value)}
                      name="joinCode"
                      type="text"
                      className="text-center border border-dark rounded py-1 px-3 col-3"
                      maxLength="6"
                    />
                  </div>

                  <div className="modal-footer justify-content-center w-100">
                    <small className="text-danger col-12 text-center">
                      {message}
                    </small>
                    <button
                      type="button"
                      className="btn btn-primary"
                      data-bs-dismiss={
                        message === "Section doesn't exist or wrong uid" ? " " : "modal"
                      }
                      onClick={Join}
                    >
                      JOIN
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* End of Modal for Add test */}
          </div>
          <div className="d-sm-flex d-none gap-md-2 gap-1 position-absolute end-0 align-self-end">
            <button
              className="btn btn-outline-dark btn-sm"
              onClick={() => console.log(testList)}
            >
              TEST NAME
            </button>
            <button
              className="btn btn-outline-dark btn-sm"
              onClick={() => console.log(testNameMap)}
            >
              SUBJECT
            </button>
            <button className="btn btn-outline-dark btn-sm">COURSE</button>
            <button className="btn btn-outline-dark btn-sm">STATUS</button>
          </div>
        </div>
        <div className="row m-0 mt-2 col-12 gap-2">
          {testList.map((sections, index) => (
            <div key={index} className="p-0">
              <h5 className="m-0 border border-dark py-2 text-center rounded mb-1 dropdown-toggle"
               onClick={() => setDropdown(dropdown === index ? null : index)}
              >
                {sections.Section_Uid} {sections.Section_Subject}
              </h5>
              <div className={`${dropdown === index ? "d-flex": "d-none"} flex-column gap-2 py-2 px-3`}>
                {/* Published test */}
                {testNameMap
                  .filter((tests) => tests.Section_Uid === sections.Section_Uid)
                  .map((Tests, idx) => (
                    <div
                      className="p-1 px-3 border border-dark rounded col-12"
                      key={idx}
                    > <Link
                          href={{
                            pathname: "/Student/Result",
                            query: {
                              studentid: TUPCID,
                              uidoftest: Tests.Uid_Test,
                            },
                          }}
                          className="link-dark text-decoration-none"
                        >
                      <h5 className="m-0 py-2">
                        Test Uid: {Tests.Uid_Test} | Test Name:{" "}
                        {Tests.TestName} |{" "}
                        {studentScores && studentScores.length > idx
                          ? `GRADED | ${studentScores[idx].TOTALSCORE} / ${studentScores[idx].MAXSCORE}`
                          : "PENDING | Score not available"}
                      </h5>
                      </Link>
                    </div>
                  ))}
                
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
export default StudentTestList;