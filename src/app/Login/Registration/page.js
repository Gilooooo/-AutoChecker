"use client";
import Footer from "@/Components/Default fix/Footer";
import Header from "@/Components/Default fix/Header";
import FacultyRegistration from "@/Components/Register/FacultyRegistration";
import OptionPosition from "@/Components/Register/OptionPosition";
import StudentRegistration from "@/Components/Register/StudentRegistration";
import { useState } from "react";
function RegisterPage() {
  const [position, setPosition] = useState("");

  const studentposition = () => {
    setPosition("STUDENT");
  };
  const facultyposition = () => {
    setPosition("FACULTY");
  };
  return (
    <>
      <Header />
      <div>
        {position == "STUDENT" ? (
          <StudentRegistration />
        ) : position == "FACULTY" ? (
          <FacultyRegistration />
        ) : (
          <OptionPosition student={studentposition} faculty={facultyposition} />
        )}
      </div>
      <Footer />
    </>
  );
}
export default RegisterPage;
