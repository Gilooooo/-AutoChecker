"use client";

import { useSearchParams } from "next/navigation";

function AdminDashboard() {
  const params = useSearchParams();
  const Username = params.get("Username");
  return (
    <main className="p-0 vh-100 w-100">
      <section className="contatiner col-12 pe-2 text-start  d-flex flex-column align-items-center justify-content-center">
        <h2 className="align-self-start px-2 w-100 border-bottom border-dark py-1">ADMIN DASHBOARD</h2>
        <section className="container-fluid col-12">
          <div className="row p-0">
            <div className="col-6">
              <h2>WELCOME!</h2>
              <h2>{Username}</h2>
            </div>
            <div className="col-6 d-flex flex-column gap-3 align-self-center ps-1 mb-2">
              <span className="border border-dark py-1 px-3 col-lg-5 col-md-7 col-8 rounded">
                FACULTIES ONLINE:
              </span>
              <span className="border border-dark py-1 px-3 col-lg-5 col-md-7 col-8 rounded">
                STUDENTS ONLINE:
              </span>
            </div>
            <div className="col-6 pe-1 mb-2">
              <span className="d-flex justify-content-between align-items-center bg-secondary rounded py-1 px-3">
                RECENTLY REGISTERED
                <button className="btn btn-outline-light btn-sm border-secondary custom-black-color">
                  View all
                </button>
              </span>
            </div>
            <div className="col-6 ps-1">
              <span className="d-flex justify-content-between align-items-center bg-secondary rounded py-1 px-3">
                RECENTLY LOGGED IN/OUT
                <button className="btn btn-outline-light btn-sm border-secondary custom-black-color">
                  View all
                </button>
              </span>
            </div>

            <div className="col-6 rounded pe-1 table-responsive custom-table-h">
              <table className="table-secondary table table-bordered border-secondary overflow-auto ">
                <thead  >
                  <tr>
                    <th scope="col">NAME</th>
                    <th scope="col">EMAIL</th>
                    <th scope="col">FACULTY</th>
                    <th scope="col">STUDENT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>ANGELO SABORNIDO</td>
                    <td>ANGELO.SABORNIDO@GSFE.TUPCAVITE.EDU.PH</td>
                    <td>-</td>
                    <td>YES</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="col-6 ps-1 table-responsive">
              <table className="table table-secondary table-bordered border-secondary">
                <thead>
                  <tr>
                    <th scope="col">NAME</th>
                    <th scope="col">LOGIN</th>
                    <th scope="col">LOGOUT</th>
                    <th scope="col">DATE</th>
                    <th scope="col">TIME</th>
                  </tr>
                </thead>
                <tbody>
                  <tr></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
export default AdminDashboard;
