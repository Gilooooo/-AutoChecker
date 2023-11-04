"use client";
import axios from "axios";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import Link from "next/link";

function FacultyRegistration() {
  const [showError, setShowerror] = useState(false);
  const [showSuccessfull, setShowsuccessfull] = useState(false);
  const [showPassword, setShowpassword] = useState(false);
  // RegExp
  const gsfeRegExp = /@gsfe.tupcavite.edu.ph/;
  const tupcRegExp = /ID-\d{4}$/;;

  const schema = yup.object().shape({
    TUPCID: yup.string().matches(tupcRegExp, "Invalid TUPC-ID!"),
    SURNAME: yup.string().required("Surname is Required!"),
    FIRSTNAME: yup.string().required("Firstname is Required!"),
    MIDDLENAME: yup.string().min(2).required("Middlename is Required!"),
    GSFEACC: yup.string().matches(gsfeRegExp, "Invalid gsfe account!"),
    SUBJECTDEPT: yup.string().required("Please Choose!"),
    PASSWORD: yup.string().min(6).required("Password Required!"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const submitForm = async (data) => {
    try {
      const response = await axios.post(
        "http://localhost:3001/FacultyRegister",
        data
      );
      if (response.status === 200) {
        //prompt modal
        setShowsuccessfull(true);
      } else {
        //prompt modal
        alert("aww");
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        //prompt modal
        setShowerror(true);
      } else {
        alert("problem");
        throw err;
      }
    }
  };

  return (
    <main className="custom-h d-flex justify-content-center align-items-center">
      <section className="contatiner col-sm-9 col-md-8 col-lg-8 col-xl-7 col-11 text-sm-start text-center d-flex flex-column align-items-center justify-content-center">
        <h2>FACULTY REGISTRATION</h2>
        <form
          className="container col-lg-9 col-xl-8 col-md-11 border border-dark row justify-content-center rounded gap-2 py-3 "
          onSubmit={handleSubmit(submitForm)}
        >
          <div className="row">
            <p className="col-sm-5 m-0 align-self-center">TUPC ID</p>
            <input
              className="col-sm-7 px-3 py-1 rounded border border-dark"
              type="text"
              {...register("TUPCID")}
            />
            <small className="text-sm-end text-center text-danger">
              {errors.TUPCID?.message}
            </small>
          </div>
          <div className="row">
            <p className="col-sm-5 m-0 align-self-center">SURNAME</p>
            <input
              className="col-sm-7 px-3 py-1 rounded border border-dark"
              type="text"
              {...register("SURNAME")}
            />
            <small className="text-sm-end text-center text-danger">
              {errors.SURNAME?.message}
            </small>
          </div>
          <div className="row">
            <p className="col-sm-5 m-0 align-self-center">FIRSTNAME</p>
            <input
              className="col-sm-7 px-3 py-1 rounded border border-dark"
              type="text"
              {...register("FIRSTNAME")}
            />
            <small className="text-sm-end text-center text-danger">
              {errors.FIRSTNAME?.message}
            </small>
          </div>
          <div className="row">
            <p className="col-sm-5 m-0 align-self-center">MIDDLENAME</p>
            <input
              className="col-sm-7 px-3 py-1 rounded border border-dark"
              type="text"
              {...register("MIDDLENAME")}
            />
            <small className="text-sm-end text-center text-danger">
              {errors.MIDDLENAME?.message}
            </small>
          </div>
          <div className="row">
            <p className="col-sm-5 m-0 align-self-center">GSFE ACCOUNT</p>
            <input
              className="col-sm-7 px-3 py-1 rounded border border-dark"
              type="text"
              {...register("GSFEACC")}
            />
            <small className="text-sm-end text-center text-danger">
              {errors.GSFEACC?.message}
            </small>
          </div>
          <div className="row">
            <p className="col-sm-5 m-0 align-self-center">SUBJECT DEPARTMENT</p>
            <select
              className="col-sm-7 px-3 py-1 rounded border border-dark"
              {...register("SUBJECTDEPT")}
            >
              <option value="" selected hidden disabled>
                Choose...
              </option>
              <option value="DIT">Department of Industrial Technology</option>
              <option value="DED">Department of Industrial Education</option>
              <option value="DES">Department of Engineering Sciences</option>
              <option value="DLA">Department of Liberal Arts</option>
              <option value="DMS">
                Department of Mathematics and Sciences
              </option>
            </select>
            <small className="text-sm-end text-center text-danger">
              {errors.SUBJECTDEPT?.message}
            </small>
          </div>

          <div className="row">
            <p className="col-sm-5 m-0 align-self-center">PASSWORD</p>
            <div className="position-relative col-sm-7 p-0">
              <input
                className="col-12 px-3 py-1 rounded border border-dark"
                type={showPassword ? "text" : "password"}
                {...register("PASSWORD")}
              />
              {showPassword ? (
                <i
                  onClick={() => setShowpassword(!showPassword)}
                  className="bi bi-eye-slash custom-black-color fs-4 position-absolute"
                  style={{ width: "36px", right: "0px" }}
                ></i>
              ) : (
                <i
                  onClick={() => setShowpassword(!showPassword)}
                  className="bi bi-eye custom-black-color fs-4 position-absolute"
                  style={{ width: "36px", right: "0px" }}
                ></i>
              )}
            </div>
            <small className="text-sm-end text-center text-danger">
              {errors.PASSWORD?.message}
            </small>
          </div>
          <div className="text-center">
            <button className="btn btn-outline-dark" type="submit">
              REGISTER
            </button>
          </div>
        </form>
      </section>
      {/* Modal for successfull register */}
      {showSuccessfull && (
        <div className="d-block modal bg-secondary" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Successfull</h5>
              </div>
              <div className="modal-body">
                <p>Your account is successfully registered</p>
              </div>
              <div className="modal-footer align-self-center">
                <Link href="/Login">
                  <button
                    type="button"
                    className="btn btn-primary"
                    data-bs-dismiss="modal"
                  >
                    Ok
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* End of Modal */}
      {/* Modal for already registered */}
      {showError && (
        <div
          className="d-block modal bg-secondary"
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Already registered</h5>
              </div>
              <div className="modal-body">
                <p>You are already registered</p>
              </div>
              <div className="modal-footer align-self-center">
                <Link href="/Login">
                  <button
                    type="button"
                    className="btn btn-primary"
                    data-bs-dismiss="modal"
                  >
                    Ok
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* End of modal */}
    </main>
  );
}
export default FacultyRegistration;
