import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function Records() {
  const searchparams = useSearchParams();
  const testname = searchparams.get("testname");
  const sectionname = searchparams.get("sectionname");
  const uid = searchparams.get("uid");
  const semester = searchparams.get("semester");
  return (
    <main className="min-vh-100 p-2 w-100">
      <section className="h-100">
        <div className="d-flex align-items-center">
          <a href="/Faculty">
            <i className="bi bi-arrow-left fs-3 custom-black-color "></i>
          </a>
          &nbsp;
          <h3 className="m-0">
            {sectionname}: {semester} - {testname} UID: {uid}{" "}
          </h3>
        </div>
        <ul className="d-flex flex-wrap justify-content-around mt-3 list-unstyled">
          <Link
            href={{
              pathname: "/Faculty/Test/TestPaper",
              query: {
                testname: testname,
                uid: uid,
                sectionname: sectionname,
                semester: semester,
              },
            }}
            className="text-decoration-none link-dark"
          >
            <li className="m-0 fs-5">TEST PAPER</li>
          </Link>
          <Link
            href={{
              pathname: "/Faculty/Test/AnswerSheet",
              query: {
                testname: testname,
                uid: uid,
                sectionname: sectionname,
                semester: semester,
              },
            }}
            className="text-decoration-none link-dark"
          >
            <li className="m-0 fs-5 text-decoration-none">ANSWER SHEET</li>
          </Link>
          <Link
            href={{
              pathname: "/Faculty/Test/AnswerKey",
              query: {
                testname: testname,
                uid: uid,
                sectionname: sectionname,
                semester: semester,
              },
            }}
            className="text-decoration-none link-dark"
          >
            <li className="m-0 fs-5">ANSWER KEY</li>
          </Link>

          <li className="m-0 fs-5 text-decoration-underline">RECORDS</li>
        </ul>
        {/* CONTENT */}
        <section className="container col-12 col-xl-7 mt-5 py-4 col-10 px-3 border border-dark rounded h-75">
          <div className="border border-dark rounded h-100 overflow-auto">
            <ul className="d-flex justify-content-around list-unstyled text-center ">
              <li className="col-sm-3 col-7 border border-dark custom-round1 text-break px-2 py-3">
                STUDENT ID
              </li>
              <li className="col-sm-3 col-7 border border-dark text-break px-2 py-3">
                STUDENT NAME
              </li>
              <li className="col-sm-2 col-7 border border-dark text-break px-2 py-3">
                NO. OF CORRECT
              </li>
              <li className="col-sm-2 col-7 border border-dark text-break px-2 py-3">
                WRONG QUESTIONS
              </li>
              <li className="col-sm-2 col-7 border border-dark custom-round2 text-break px-2 py-3">
                TOTAL SCORE
              </li>
            </ul>
          </div>
        </section>
        {/* END CONTENT */}
      </section>
    </main>
  );
}
