import { useTUPCID } from "@/app/Provider";
import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";

function FacultySettings({ clicked, setClicked }) {
  const [Faculty, setFaculty] = useState({});
  const { TUPCID } = useTUPCID();
  const [edit, setEdit] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [surName, setSurName] = useState("");
  const [gsfe, setGsfe] = useState("");
  const [subjectDepartment, setSubjectDepartment] = useState("");
  const gsfeRegExp = /@gsfe.tupcavite.edu.ph/;

  const schema = yup.object().shape({
    FirstName: yup.string().required("Required"),
    MiddleName: yup.string().min(2).required("Required"),
    SurName: yup.string().required("Required"),
    GSFEACC: yup.string().matches(gsfeRegExp, "Invalid gsfe account!"),
    SUBJECTDEPT: yup.string().required("Please Choose!"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const subjectDept = {
    DIT: "Department of Information Technology",
    DED: "Department of Industrial Education",
    DES: "Department of Engineering Sciences",
    DLA: "Department of Liberal Arts",
    DMS: "Department of Mathematics and Sciences",
  };
  const fetchInfo = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/FacultySettings?UidProf=${TUPCID}`
      );
      setFaculty(response.data[0]);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    const fetching = setInterval(() => {
      if (!edit) {
        return;
      }
      fetchInfo();
    }, 1000);
    return () => {
      clearInterval(fetching);
    };
  }, [TUPCID, edit]);

  const isEdit = () => {
    setEdit(!edit)
  }
  const Changes = async (data) => {
    console.log(data);
  };
  const handleclick = () => {
    setClicked(!clicked);
  };
  return (
    <main className="w-100 min-vh-100">
      <section className="container-fluid col-12 p-2 d-flex flex-column">
        <div className="d-flex ">
          <i
            className="d-block d-sm-none bi bi-list fs-5 pe-auto custom-red px-2 rounded"
            onClick={handleclick}
          ></i>
          <Link href={{ pathname: "/Faculty" }}>
            <i className="bi bi-arrow-left fs-3 custom-black-color d-sm-block d-none"></i>
          </Link>
          <h2 className="m-0 w-100 text-sm-start text-center pe-3">SETTINGS</h2>
        </div>
        <h3 className="text-center" onClick={() => console.log(edit)}>
          UPDATE PERSONAL INFO
        </h3>
        <form
          className="container border border-dark rounded d-flex flex-column col-xl-5 col-lg-7 col-md-8  align-items-center gap-1 py-3"
          onSubmit={handleSubmit(Changes)}
        >
          <span onClick={isEdit} className="align-self-end">
            EDIT
          </span>
          <div className="row gap-2 col-12 justify-content-center align-items-center">
            <label className="col-5">ID NUMBER</label>
            <input
              value={Faculty.TUPCID || ""}
              type="text"
              className="col-6 border border-dark px-3 py-1 rounded mb-2"
              disabled
            />
          </div>
          <div className="row gap-2 col-12 justify-content-center align-items-center">
            <label className="col-5">FIRST NAME</label>
            <input
              value={Faculty.FIRSTNAME || ""}
              type="text"
              className="col-6 border border-dark px-3 py-1 rounded"
              disabled={edit}
              {...register("FirstName")}
            />
            <small className="text-end text-danger">
              {errors.FirstName?.message8}
            </small>
          </div>
          <div className="row gap-2 col-12 justify-content-center align-items-center">
            <label className="col-5">MIDDLE NAME</label>
            <input
              value={Faculty.MIDDLENAME || ""}
              type="text"
              className="col-6 border border-dark px-3 py-1 rounded"
              disabled={edit}
              {...register("MiddleName")}
            />
            <small className="text-end text-danger">
              {errors.MiddleName?.message}
            </small>
          </div>
          <div className="row gap-2 col-12 justify-content-center align-items-center">
            <label className="col-5">SURNAME</label>
            <input
              value={Faculty.SURNAME || ""}
              type="text"
              className="col-6 border border-dark px-3 py-1 rounded"
              disabled={edit}
              {...register("SurName")}
            />
            <small className="text-end text-danger">
              {errors.SurName?.message}
            </small>
          </div>
          <div className="row gap-2 col-12 justify-content-center align-items-center">
            <label className="col-5">GSFE ACCOUNT</label>
            <input
              value={Faculty.GSFEACC || ""}
              type="text"
              className="col-6 border border-dark px-3 py-1 rounded"
              {...register("GSFEACC")}
            />
            <small className="text-end text-danger">
              {errors.GSFEACC?.message}
            </small>
          </div>
          <div className="row gap-2 col-12 justify-content-center align-items-center">
            <label className="col-5">SUBJECT DEPARTMENT</label>
            <select
              type="text"
              className="col-6 border border-dark px-3 py-1 rounded"
              disabled={edit}
              {...register("SUBJECTDEPT")}
            >
              <option value={Faculty.SUBJECTDEPT || ""} hidden>
                {subjectDept[Faculty.SUBJECTDEPT || ""]}
              </option>
              <option value="DIT">Department of Industrial Technology</option>
              <option value="DED">Department of Industrial Education</option>
              <option value="DES">Department of Engineering Sciences</option>
              <option value="DLA">Department of Liberal Arts</option>
              <option value="DMS">
                Department of Mathematics and Sciences
              </option>
            </select>
            <small className="text-end text-danger">
              {errors.SUBJECTDEPT?.message}
            </small>
          </div>
          <div className="row gap-2 col-12 justify-content-center align-items-center">
            <label className="col-5">PASSWORD</label>
            <input
              type="text"
              value={Faculty.PASSWORD || ""}
              className="px-3 py-1 col-6 rounded border border-dark "
              disabled={edit}
            />
          </div>
          {!edit && (
            <button className="btn btn-outline-dark" type="submit">
              Save
            </button>
          )}
        </form>
      </section>
    </main>
  );
}
export default FacultySettings;
