"use client";
import { useTUPCID } from "@/app/Provider";
import Link from "next/link";

function StudentsList() {
  const {TUPCID} = useTUPCID();
  return (
    <main className="w-100 min-vh-100 d-flex justify-content-center">
      <section className="contatiner col-12 text-sm-start text-center d-flex flex-column align-items-start p-2">
        <div className="d-flex gap-2 align-items-center mb-3">
          <Link
            href={{
              pathname: "/Faculty/ListOfTest"
            }}
          >
            <i className="bi bi-arrow-left fs-3 text-dark "></i>
          </Link>
          <h2 className="m-0">FACULTY</h2>
        </div>
        <div className="d-flex justify-content-between w-100 px-2">
          <h3>PRESETS</h3>
          <div className="align-self-end">
            <small>Sort by:</small>
          </div>
        </div>
        {/* Tests */}
        <div className="row m-0 mt-4 col-12 gap-1">
          <div className="d-flex gap-2">
            <div className="border border-dark rounded px-2 py-1 w-100">
              <span>STUDENT</span>
            </div>
            <input type="checkbox" />
          </div>
        </div>
        {/* End of Tests  */}
      </section>
    </main>
  );
}
export default StudentsList;
