const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
const expressSession = require("express-session");
const cookieParser = require("cookie-parser");
const bcryptjs = require("bcryptjs");
const connection = require("./database");
const nodemailer = require("nodemailer");
const officegen = require("officegen");
const romanize = require("romanize");
const PDFDocument = require("pdfkit");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  expressSession({
    secret: "mySecretKey",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser("mySecretKey"));
app.use(passport.initialize());
app.use(passport.session());
require("./passportConfig")(passport);

//START FUNCTIONS
const checkExist = async (uidStudent, Uid_Professor, Uid_Section) => {
  try {
    const query =
      "SELECT COUNT(*) as count from enrolled_sections WHERE Student_Uid = ? AND Professor_Uid = ? AND Section_Uid = ?";
    const [count] = await connection.query(query, [
      uidStudent,
      Uid_Professor,
      Uid_Section,
    ]);
    if (count[0].count === 0) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
};

const checkPublish = async (Uid_Test) => {
  try {
    const query = "SELECT COUNT(*) as count from publish_test WHERE Uid_Test = ?";
    const [count] = await connection.query(query, [Uid_Test]);
    if (count[0].count === 0) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
};
const getInfoProf = async (UidProf) => {
  try {
    const query =
      "SELECT SUBJECTDEPT, SURNAME, FIRSTNAME, MIDDLENAME, TUPCID FROM faculty_accounts WHERE uid = ?";
    const [row] = await connection.query(query, [UidProf]);
    return row;
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
};
const getInfo = async (Student_Uid) => {
  try {
    const query =
      "SELECT TUPCID, SURNAME, FIRSTNAME, MIDDLENAME FROM student_accounts WHERE uid = ?";
    const [row] = await connection.query(query, [Student_Uid]);
    return row;
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
};
const sendCode = async (GSFEACC, code) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "eos2022to2023@gmail.com",
      pass: "ujfshqykrtepqlau",
    },
  });

  const mailOptions = {
    from: "eos2022to2023@gmail.com",
    to: GSFEACC,
    subject: "Forgot Password Code",
    text: `Good day! In order to update your password in the current account, please use the following 6-digit code: ${code}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
};

const Reportproblem = async (GSFEACC, MESSAGE) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "eos2022to2023@gmail.com",
      pass: "ujfshqykrtepqlau",
    },
  });
  const mailOptions = {
    from: "eos2022to2023@gmail.com",
    to: "eosteam22@gmail.com",
    subject: "Web application problem",
    text: `Report from user ${GSFEACC} \r\nMessage: ${MESSAGE}`,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
};
// Checking if the account is exist for student and faculty
const checkAccount = async (TUPCID) => {
  try {
    const checkquery = "SELECT TUPCID from student_accounts WHERE TUPCID = ?";
    const checkquery2 = "SELECT TUPCID from faculty_accounts WHERE TUPCID = ?";
    const [accounts] = await connection.query(checkquery, [TUPCID]);
    const [accounts2] = await connection.query(checkquery2, [TUPCID]);
    return accounts.length || accounts2.length > 0;
  } catch (error) {
    throw error;
  }
};
// Checking the type of the TUPCID either student or faculty
const checkType = async (table, Tupcid, Password, accountType) => {
  try {
    const query = `SELECT * FROM ${table}_accounts WHERE TUPCID = ?`;
    const [rows] = await connection.query(query, [Tupcid]);
    if (rows.length === 0) {
      return { accountType: null };
    }
    const user = rows[0];

    const isPasswordMatch = await bcryptjs.compare(Password, user.PASSWORD);
    if (isPasswordMatch) {
      return { accountType: accountType, uid: user.uid };
    } else {
      return { accountType: null };
    }
  } catch (error) {
    throw error;
  }
};

//Checking what account type for forgetpassword
const accountType = async (TUPCID) => {
  try {
    const student = "SELECT TUPCID FROM student_accounts WHERE TUPCID = ?";
    const faculty = "SELECT TUPCID FROM faculty_accounts WHERE TUPCID = ?";
    const [resultstudent] = await connection.query(student, [TUPCID]);
    const [resultfaculty] = await connection.query(faculty, [TUPCID]);

    if (resultfaculty.length > 0) {
      return "faculty";
    } else if (resultstudent.length > 0) {
      return "student";
    } else {
      return null;
    }
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
};
//END FUNCTIONS

app.post("/StudentRegister", async (req, res) => {
  const {
    TUPCID,
    SURNAME,
    FIRSTNAME,
    MIDDLENAME,
    GSFEACC,
    COURSE,
    SECTION,
    YEAR,
    STATUS,
    PASSWORD,
  } = req.body;

  //If the TUPCID is already registered
  try {
    const isAccountExist = await checkAccount(TUPCID);

    if (isAccountExist) {
      return res.status(409).send({
        message: "Account already registered",
      });
    }

    if (STATUS !== "REGULAR" && STATUS !== "IRREGULAR") {
      return res.status(400).send({ message: "Invalid STATUS" });
    }

    const hashedPassword = await bcryptjs.hash(PASSWORD, 10);
    const uidTUPCID = await bcryptjs.hash(TUPCID, 2);

    const insertQuery =
      "INSERT INTO student_accounts (uid, TUPCID, SURNAME, FIRSTNAME, MIDDLENAME, GSFEACC, COURSE, SECTION, YEAR, STATUS, PASSWORD) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    await connection.query(insertQuery, [
      uidTUPCID,
      TUPCID,
      SURNAME,
      FIRSTNAME,
      MIDDLENAME,
      GSFEACC,
      COURSE,
      SECTION,
      YEAR,
      STATUS,
      hashedPassword,
    ]);

    return res.status(200).send({ message: "Account successfully registered" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({ message: "Server error" });
  }
});

app.post("/FacultyRegister", async (req, res) => {
  const {
    TUPCID,
    SURNAME,
    FIRSTNAME,
    MIDDLENAME,
    GSFEACC,
    SUBJECTDEPT,
    PASSWORD,
  } = req.body;

  //If the TUPCID is already registered
  try {
    const isAccountExist = await checkAccount(TUPCID);

    if (isAccountExist) {
      return res.status(409).send({
        message: "Account already registered",
      });
    }
    const hashedPassword = await bcryptjs.hash(PASSWORD, 10);
    const uidTUPCID = await bcryptjs.hash(TUPCID, 2);

    const insertQuery =
      "INSERT INTO faculty_accounts (uid, TUPCID, SURNAME, FIRSTNAME, MIDDLENAME, GSFEACC, SUBJECTDEPT, PASSWORD) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    await connection.query(insertQuery, [
      uidTUPCID,
      TUPCID,
      SURNAME,
      FIRSTNAME,
      MIDDLENAME,
      GSFEACC,
      SUBJECTDEPT,
      hashedPassword,
    ]);

    return res.status(200).send({ message: "Account successfully registered" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({ message: "Server error" });
  }
});

//Login for student and Faculty
app.post("/Login", async (req, res) => {
  const { Tupcid, Password } = req.body;
  try {
    const studentLoginResult = await checkType(
      "student",
      Tupcid,
      Password,
      "student"
    );
    const facultyLoginResult = await checkType(
      "faculty",
      Tupcid,
      Password,
      "faculty"
    );

    if (studentLoginResult.accountType === "student") {
      res.json({ accountType: "student", Uid: studentLoginResult.uid });
    } else if (facultyLoginResult.accountType === "faculty") {
      res.json({ accountType: "faculty", Uid: facultyLoginResult.uid });
    } else {
      res.status(404).json({ message: "Account does not exist" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res
      .status(500)
      .json({ message: "An error occurred. Please try again later." });
  }
});
//Admin Login
app.post("/AdminLogin", async (req, res) => {
  const { Account_Number, Password } = req.body;
  try {
    const query =
      "SELECT Uid_Account, Password FROM admin_account WHERE Account_Number = ?";
    const [row] = await connection.query(query, [Account_Number]);
    const hash = await bcryptjs.compare(Password, row[0].Password);
    if (hash) {
      const { Uid_Account } = row[0];
      return res.status(200).send({ Uid_Account });
    } else {
      return res.status(409).send({ message: "Wrong Password" });
    }
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
});
//Forgetpassword
app.post("/ForgetPassword", async (req, res) => {
  const { TUPCID, GSFEACC } = req.query;
  const min = 100000;
  const max = 999999;
  const randomNumber = Math.floor(Math.random() * (max - min + 1) + min);
  const code = randomNumber.toString().padStart(6, "0");
  sendCode(GSFEACC, code);
  try {
    const query =
      "INSERT INTO passwordreset_accounts (TUPCID, GSFEACC, code, accountType) values (?, ?, ?, ?)";
    const accounttype = await accountType(TUPCID);
    await connection.query(query, [TUPCID, GSFEACC, code, accounttype]);
    return res
      .status(200)
      .send({ message: "Successfully send to your GSFE ACCOUNT!" });
  } catch (err) {
    return res
      .status(409)
      .send({ message: "There is a problem try again later" });
  }
});

//MatchCode
app.post("/MatchCode", async (req, res) => {
  const { Code } = req.body;
  try {
    const query =
      "SELECT TUPCID, accountType FROM passwordreset_accounts WHERE code = ?";
    const [coderows] = await connection.query(query, [Code]);
    const deleteCode = "DELETE FROM passwordreset_accounts WHERE code = ?";
    await connection.query(deleteCode, [Code]);
    if (coderows.length > 0) {
      const { TUPCID, accountType } = coderows[0];
      return res.status(200).send({ TUPCID, accountType });
    } else {
      return res.status(409).send({ message: "Wrong Code" });
    }
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
});
//UpdatePassword
app.put("/UpdatePassword", async (req, res) => {
  const { NewPassword } = req.body;
  const { TUPCID } = req.query;
  try {
    const hashedPassword = await bcryptjs.hash(NewPassword, 10);
    const accounttype = await accountType(TUPCID);
    const query = `UPDATE ${accounttype}_accounts SET PASSWORD = ? WHERE TUPCID = ?`;
    await connection.query(query, [hashedPassword, TUPCID]);
    return res.status(200).send({ message: "Done" });
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
});

//Aside
//Faculty
app.get("/FacultyAside", async (req, res) => {
  const { UidProf } = req.query;
  try {
    const query = "SELECT * FROM faculty_accounts WHERE uid = ?";
    const [row] = await connection.query(query, [UidProf]);
    return res.status(200).json(row);
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
});
//Student
app.get("/StudentAside", async (req, res) => {
  const { TUPCID } = req.query;
  try {
    const query = "SELECT * FROM student_accounts WHERE uid = ?";
    const [row] = await connection.query(query, [TUPCID]);
    return res.status(200).json(row);
  } catch (err) {}
});

//Student_Admin
app.get("/Admin_Students", async (req, res) => {
  try {
    const query = "SELECT * FROM student_accounts";
    const [row] = await connection.query(query);
    return res.status(200).json(row);
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
});
//Faculty
app.get("/Admin_Faculty", async (req, res) => {
  try {
    const query = "SELECT * FROM faculty_accounts";
    const [row] = await connection.query(query);
    return res.status(200).json(row);
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
});

app.get("/Admin_FacultyTestList", async (req, res) => {
  try {
    const query =
      "SELECT Professor_FirstName, Professor_MiddleName, Professor_LastName, Professor_SubjectDept, Professor_ID, TestName, Subject, Section_Name, Uid_Test FROM faculty_testlist";
    const [row] = await connection.query(query);
    return res.status(200).json(row);
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
});

//Admin
app.get("/AdminAside", async (req, res) => {
  const { Uid_Account } = req.query;
  try {
    const query =
      "SELECT Account_Number, Username FROM admin_account WHERE Uid_Account = ?";
    const [row] = await connection.query(query, [Uid_Account]);
    return res.status(200).json(row);
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
});

//ReportProblem
//Faculty
app.get("/FacultyReportProblem", async (req, res) => {
  const { UidProf } = req.query;
  try {
    const query = "SELECT GSFEACC FROM faculty_accounts WHERE uid = ?";
    const [row] = await connection.query(query, [UidProf]);
    return res.status(200).send(row[0]);
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
});

//Student
app.get("/StudentReportProblem", async (req, res) => {
  const { TUPCID } = req.query;
  try {
    const query = "SELECT GSFEACC FROM student_accounts WHERE uid = ?";
    const [row] = await connection.query(query, [TUPCID]);
    return res.status(200).send(row);
  } catch (err) {
    throw err;
  }
});

app.post("/ReportProblem", (req, res) => {
  const { GSFEACC, MESSAGE } = req.body;
  try {
    Reportproblem(GSFEACC, MESSAGE);
    return res.status(200).send({ message: "DONE" });
  } catch (err) {
    throw err;
  }
});
//Admin

// FacultyTestList
app.get("/TestListSectionName", async (req, res) => {
  const { UidProf } = req.query;
  try {
    const query =
      "SELECT Subject, Section_Name, Uid_Section FROM faculty_sections WHERE Uid_Professor = ?";
    const [section_names] = await connection.query(query, [UidProf]);
    return res.status(200).json(section_names);
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
});

app.post("/TestList", async (req, res) => {
  const { TestName, Subject, UidTest, UidProf, SectionName, Semester, Uid_section } =
    req.body;
  try {
    const infos = await getInfoProf(UidProf);
    const query1 =
      "INSERT INTO faculty_testlist (Professor_FirstName, Professor_MiddleName, Professor_LastName, Professor_SubjectDept, Professor_ID, TestName, Subject, Section_Name, Semester, Uid_Section, Uid_Test, Uid_Professor, date_created) values (?, ?, ? ,? ,?, ?, ?, ?, ?, ?, ?, ?, NOW())";
    const query2 =
      "INSERT INTO preset_faculty_testlist (Professor_FirstName, Professor_MiddleName, Professor_LastName, Professor_SubjectDept, Professor_ID, TestName, Subject, Section_Name, Semester, Uid_Section, Uid_Test, Uid_Professor, date_created) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
    await connection.query(query1, [
      infos[0].FIRSTNAME,
      infos[0].MIDDLENAME,
      infos[0].SURNAME,
      infos[0].SUBJECTDEPT,
      infos[0].TUPCID,
      TestName,
      Subject,
      SectionName,
      Semester,
      Uid_section,
      UidTest,
      UidProf,
    ]);
    await connection.query(query2, [
      infos[0].FIRSTNAME,
      infos[0].MIDDLENAME,
      infos[0].SURNAME,
      infos[0].SUBJECTDEPT,
      infos[0].TUPCID,
      TestName,
      Subject,
      SectionName,
      Semester,
      Uid_section,
      UidTest,
      UidProf,
    ]);
    return res.status(200).send({ message: "done" });
  } catch (err) {
    throw err;
  }
});

app.get("/TestList", async (req, res) => {
  const { UidProf } = req.query;
  try {
    const query = "SELECT * FROM faculty_testlist WHERE Uid_Professor = ?";
    const [row] = await connection.query(query, [UidProf]);
    return res.status(200).json(row);
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
});

app.post("/CheckPublish", async (req, res) => {
  const [Uids] = req.body;
  try {
    const existingItems = [];
    for (let i = 0; i < Uids.length; i++) {
      const query = "SELECT COUNT(*) as count FROM publish_test WHERE Uid_Test = ?"
      const [row] = await connection.query(query, [Uids[i]]);
      if(row[0].count === 1){
        existingItems.push(Uids[i])
      }
    }
    return res.status(200).json({ existingItems });
  } catch (err) {
    throw err
  }
});

app.delete("/TestList", async (req, res) => {
  const { UidTest } = req.query;
  try {
    const query1 = "DELETE FROM publish_test WHERE Uid_Test = ?";
    const query = "DELETE FROM faculty_testlist WHERE Uid_Test = ?";
    await connection.query(query1,[UidTest])
    await connection.query(query, [UidTest]);
    return res.status(200).send({ message: "Done" });
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
});

app.post("/PublishTest", async (req, res) => {
  const { Uid_Prof } = req.query;
  const { TestName, UidTest, Subject, SectionName, Semester, SectionUid} = req.body;
  const TupcId = await getInfoProf(Uid_Prof);
  try {
    const checking = await checkPublish(UidTest);
    if (checking) {
      const query =
        "INSERT INTO publish_test (Professor_ID, Uid_Professor, Section_Uid, Uid_Test, Subject, Section_Name, Semester, TestName) values (?, ?, ?, ?, ?, ?, ? ,?)";
      await connection.query(query, [TupcId[0].TUPCID, Uid_Prof, SectionUid, UidTest, Subject, SectionName, Semester, TestName])
      return res.status(200).send({ message: "Done" });
    }else{
      return res.status(409).send({ message: "Already publish"})
    }
  } catch (err) {
    throw err;
  }
});
//Preset
app.get("/Preset", async (req, res) => {
  const { UidProf } = req.query;
  try {
    const query =
      "SELECT * FROM preset_faculty_testlist WHERE Uid_Professor = ?";
    const [row] = await connection.query(query, [UidProf]);
    return res.status(200).json(row);
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
});

//Faculty section
app.put("/Faculty_sections", async (req, res) => {
  const { UidProf, UidSection, SectionName, Subject, Year, Course, Section } =
    req.body;
  try {
    const query =
      "INSERT INTO faculty_sections (Uid_Professor, Uid_Section, Section_Name, Course, Year, Section, Subject, date_created) values (?, ?, ?, ?, ?, ?, ?, NOW())";
    await connection.query(query, [
      UidProf,
      UidSection,
      SectionName,
      Course,
      Year,
      Section,
      Subject,
    ]);
    return res.status(200).send({ message: "done" });
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
});

app.get("/Faculty_sections", async (req, res) => {
  const { UidProf } = req.query;
  try {
    const query = "SELECT * FROM faculty_sections WHERE Uid_Professor = ?";
    const [sections] = await connection.query(query, [UidProf]);
    return res.status(200).json(sections);
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
});

app.get("/Faculty_StudentList", async (req, res) => {
  const { Uid_Section, Section } = req.query;
  try {
    const query =
      "SELECT * FROM enrolled_sections WHERE Section_Uid = ? AND Section_Name = ? ";
    const [row] = await connection.query(query, [Uid_Section, Section]);
    return res.status(200).send(row);
  } catch (err) {
    return res.status(500).send({ message: "Internal Server error" });
  }
});

app.delete("/Faculty_Students", async (req, res) => {
  const { Uid_Section, Section, Professor_Uid } = req.query;
  const { selected } = req.body;
  try {
    const selectedStudents = selected.map(() => "?").join(",");
    const query = `DELETE FROM enrolled_sections WHERE Student_TUPCID IN (${selectedStudents}) AND Professor_Uid = ? AND Section_Uid = ? AND Section_Name = ?`;
    await connection.query(query, [
      ...selected,
      Professor_Uid,
      Uid_Section,
      Section,
    ]);
    return res.status(200).send({ message: "Mission accomplished" });
  } catch (err) {
    throw err;
  }
});
//Student
app.get("/StudentTestList", async (req, res) => {
  const { uidsection } = req.query;
  try {
    const query = "SELECT * FROM faculty_sections WHERE Uid_Section = ?";
    const [row] = await connection.query(query, [uidsection]);
    if (row.length > 0) {
      return res.status(200).json(row);
    } else {
      return res
        .status(204)
        .send({ message: "Wrong UID or no section with that UID" });
    }
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
});

app.put("/StudentTestList", async (req, res) => {
  const { uidStudent } = req.query;
  const { Uid_Professor, Uid_Section, Section_Name, Subject } = req.body;
  try {
    const StudentName = await getInfo(uidStudent);
    const checking = await checkExist(uidStudent, Uid_Professor, Uid_Section);
    if (checking) {
      const query =
        "INSERT INTO enrolled_sections (Student_TUPCID, Student_FirstName,  Student_MiddleName, Student_LastName, Student_Uid, Professor_Uid, Section_Uid, Section_Name, Section_Subject, date_added) values (?, ?, ?, ?, ?, ?, ? ,? ,?, NOW())";
      const { FIRSTNAME, MIDDLENAME, SURNAME, TUPCID } = StudentName[0];
      await connection.query(query, [
        TUPCID,
        FIRSTNAME,
        MIDDLENAME,
        SURNAME,
        uidStudent,
        Uid_Professor,
        Uid_Section,
        Section_Name,
        Subject,
      ]);
      return res.status(200).send({ message: "Inserted" });
    } else {
      return res.status(409).send({ message: "Already enrolled" });
    }
  } catch (err) {
    throw err;
  }
});

app.get("/StudentSectionList", async (req, res) => {
  const { uidStudent } = req.query;
  try {
    const query = "SELECT * FROM enrolled_sections WHERE Student_Uid = ?";
    const [row] = await connection.query(query, [uidStudent]);
    return res.status(200).send(row);
  } catch (err) {
    return res.status(500).send({ message: "Problem at the server" });
  }
});

app.post("/FetchingPublishTest", async (req, res) => {
  const uids = req.body;
  const datas = [];
  try {
    for(let i = 0; i < uids.length; i++){
      const query = "SELECT * FROM publish_test WHERE Section_Uid = ?";
      const [row] = await connection.query(query, [uids[i]]);
      if(row.length > 0){
        datas.push(row);
      }
    }
    console.log(datas);
    return res.status(200).send(datas);
  } catch (err) {
    throw err
  }
})
//Settings
//DEMO
app.get("/facultyinfos/:TUPCID", async (req, res) => {
  const { TUPCID } = req.params;
  try {
    const query = "SELECT * from faculty_accounts WHERE uid = ?";
    const [getall] = await connection.query(query, [TUPCID]);
    if (getall.length > 0) {
      const {
        TUPCID,
        FIRSTNAME,
        SURNAME,
        MIDDLENAME,
        SUBJECTDEPT,
        GSFEACC,
        PASSWORD,
      } = getall[0];
      return res.status(202).send({
        Tupcid: TUPCID,
        FIRSTNAME,
        SURNAME,
        MIDDLENAME,
        SUBJECTDEPT,
        GSFEACC,
        PASSWORD,
      });
    } else {
      return res.status(404).send({ message: "Person not found" });
    }
  } catch (error) {
    return res.status(500).send({ message: "Failed to fetch TUPCID" });
  }
});

app.put("/updatefacultyinfos/:TUPCID", async (req, res) => {
  const { TUPCID } = req.params;
  const updatedData = req.body;
  try {
    const datas = Object.keys(updatedData)
      .map((key) => `${key} = ?`)
      .join(",");
    const query = `UPDATE faculty_accounts SET ${datas} WHERE uid = ?`;
    connection.query(
      query,
      [...Object.values(updatedData), TUPCID],
      (err, result) => {
        if (err) {
          console.error("Error updating student data:", err);
          return res.status(500).send({ message: "Database error" });
        }
        return res
          .status(200)
          .send({ message: "Student updated successfully" });
      }
    );
  } catch (error) {
    console.log(error);
  }
});

app.get("/studinfos/:TUPCID", async (req, res) => {
  const { TUPCID } = req.params;
  try {
    const query = "SELECT * from student_accounts WHERE uid = ?";
    const [getall] = await connection.query(query, [TUPCID]);
    if (getall.length > 0) {
      const {
        TUPCID,
        FIRSTNAME,
        SURNAME,
        MIDDLENAME,
        COURSE,
        SECTION,
        YEAR,
        STATUS,
        GSFEACC,
        PASSWORD,
      } = getall[0];
      return res.status(202).send({
        Tupcid: TUPCID,
        FIRSTNAME,
        SURNAME,
        MIDDLENAME,
        COURSE,
        SECTION,
        YEAR,
        STATUS,
        GSFEACC,
        PASSWORD,
      });
    }
  } catch (error) {
    return res.status(500).send({ message: "Failed to fetch TUPCID" });
  }
});

app.put("/updatestudentinfos/:TUPCID", async (req, res) => {
  const { TUPCID } = req.params;
  const updatedData = req.body;
  try {
    const datas = Object.keys(updatedData)
      .map((key) => `${key} = ?`)
      .join(",");
    const query = `UPDATE student_accounts SET ${datas} WHERE uid = ?`;
    connection.query(
      query,
      [...Object.values(updatedData), TUPCID],
      (err, result) => {
        if (err) {
          console.error("Error updating student data:", err);
          return res.status(500).send({ message: "Database error" });
        }
        return res
          .status(200)
          .send({ message: "Student updated successfully" });
      }
    );
  } catch (error) {
    console.log(error);
  }
});

app.post("/createtestpaper", async (req, res) => {
  try {
    const { TUPCID, UID, test_name, section_name, semester, data } = req.body;
    console.log("Check receiving data....", TUPCID);

    const query = `
      INSERT INTO testpapers 
      (Professor_ID, UID_test, test_name, section_name, semester, questions, test_created) 
      VALUES (?, ?, ?, ?, ?,?, NOW())
    `;

    const values = [
      TUPCID,
      UID,
      test_name,
      section_name,
      semester,
      JSON.stringify(data),
    ];

    await connection.query(query, values);

    res.status(200).json({ message: "Data added to the test successfully" });
  } catch (error) {
    console.error("Error adding data to the test:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
});

app.put("/updatetestpaper/:TUPCID/:uid/:section_name", async (req, res) => {
  try {
    const { TUPCID, uid, section_name } = req.params;
    const { data } = req.body;
    const updateQuery = `
      UPDATE testpapers
      SET
        questions = ?,
        test_created = NOW() 
      WHERE Professor_ID = ? AND UID_test = ? AND section_name = ?;
    `;

    const updateValues = [JSON.stringify(data), TUPCID, uid, section_name];

    await connection.query(updateQuery, updateValues);

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error("Error updating data:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
});

app.get("/generateTestPaperpdf/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    const query = `
      SELECT questions, semester, test_name FROM testpapers WHERE UID_test = ?;
    `;
    console.log("response....", uid);

    const [testdata] = await connection.query(query, [uid]);
    console.log("response....", testdata);

    const questionsData = testdata[0].questions;
    const test_name = testdata[0].test_name;
    const semester = testdata[0].semester;

    // Create a new PDF document
    const doc = new PDFDocument();
    const filename = ` ${test_name}.pdf`;

    // Set the title based on TEST NUMBER and TEST NAME
    const title = doc.text(`${semester} ${test_name} UID:${uid}`, {
      bold: true,
      underline: true,
      fontSize: 24,
      align: "center",
    });
    doc.moveDown();
    doc.text(`Follow the directions and STRICTLY NO ERASURE.`);
    doc.moveDown();
    // Create an object to store questions grouped by questionType
    const groupedQuestions = {};

    // Group questions by questionType
    questionsData.forEach((item, index) => {
      const questionType = item.questionType;
      const question = item.question;
      const options = item.options;
      const score = item.score;

      // Check if both questionType and question are defined and not empty
      if (questionType && question) {
        if (!groupedQuestions[questionType]) {
          groupedQuestions[questionType] = [];
        }
        groupedQuestions[questionType].push({ question, options, score });
      }
    });

    // Create a counter to track the number of unique question types
    let testCounter = 1;

    // Iterate through the grouped questions and add them to the PDF document
    for (const questionType in groupedQuestions) {
      const questionsOfType = groupedQuestions[questionType];
      if (questionsOfType.length > 0) {
        // Convert the testCounter to a Roman numeral
        const romanNumeral = romanize(testCounter);

        // Determine the display text based on question type
        let displayText = "";
        let instructions = "";
        if (questionType === "MultipleChoice") {
          displayText = "Multiple Choice";
          instructions =
            "Among the given OPTIONS in the questionnaire, choose the best option and write it in CAPITAL LETTER.";
        } else if (questionType === "TrueFalse") {
          displayText = "TRUE or FALSE";
          instructions =
            "Write T if the statement is TRUE or F if the statement is FALSE.";
        } else if (questionType === "Identification") {
          displayText = "Identification";
          instructions = "Write the ANSWER in CAPITAL LETTER.";
        }

        const score = questionsOfType[0].score;
        doc.moveDown();
        const questionTypeHeading = doc.text(
          `TEST ${romanNumeral}. ${displayText} (${score} pts. each)`,
          {
            bold: true,
            fontSize: 16,
            color: "black",
          }
        );

        // Add the instructions
        const instructionParagraph = doc.text(instructions, {
          fontSize: 12,
          color: "black",
        });

        doc.moveDown();
        let questionNumber = 1; // Initialize question number

        questionsOfType.forEach((questionData, index) => {
          // Check if a new column should be started
          if (index > 0 && index % 10 === 0) {
            questionTypeHeading.addPage(); // Start a new page
          }

          const questionParagraph = doc.text(
            `${questionNumber}. ${questionData.question}`
          );
          doc.moveDown(0.5);

          // Add the question text or options as needed
          if (questionType === "MultipleChoice") {
            if (questionData.options && questionData.options.length > 0) {
              const optionsText = questionData.options
                .map(
                  (option, optionIndex) =>
                    ` ${String.fromCharCode(97 + optionIndex)}.) ${
                      option.text
                    }\n`
                )
                .join(""); // Join options with a newline character

              doc.text(optionsText);
            }
            doc.moveDown();
          }

          questionNumber++; // Increment question number
          doc.moveDown();
        });

        testCounter++;
        doc.moveDown(); // Increment testCounter for the next type
      }
    }

    // Pipe the PDF to the response stream
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    doc.pipe(res);

    // Finalize the PDF and end the response stream
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
});

app.get("/generateTestPaperdoc/:uid", async (req, res) => {
  try {
    const { uid } = req.params; // Extract parameters from URL

    // Fetch data from the database based on the parameters
    const query = `
      SELECT questions, test_name, semester FROM testpapers WHERE UID_test = ?;
    `;

    const [testdata] = await connection.query(query, [uid]);

    // Extract the questions, test_number, and test_name from the database response
    const questionsData = testdata[0].questions;
    const test_name = testdata[0].test_name;
    const semester = testdata[0].semester;

    // Create a new Word document
    const docx = officegen("docx");
    const filename = `${test_name}.docx`;

    // Define a function to add a paragraph with a specific style
    function addStyledParagraph(text, style) {
      const paragraph = docx.createP();
      paragraph.addText(text, style);
    }

    const title = `${semester}  ${test_name} UID: ${uid}`;
    docx.createP().addText(title, {
      bold: true,
      fontSize: 16,
      color: "black",
    });

    // Create an object to store questions grouped by questionType
    const groupedQuestions = {};

    // Group questions by questionType
    questionsData.forEach((item) => {
      const questionType = item.questionType;
      const question = item.question;
      const options = item.options;
      const score = item.score;

      // Check if both questionType and question are defined and not empty
      if (questionType && question) {
        if (!groupedQuestions[questionType]) {
          groupedQuestions[questionType] = [];
        }
        groupedQuestions[questionType].push({ question, options, score });
      }
    });

    // Create a counter to track the number of unique question types
    let testCounter = 1;

    // Iterate through the grouped questions and add them to the Word document
    for (const questionType in groupedQuestions) {
      const questionsOfType = groupedQuestions[questionType];
      if (questionsOfType.length > 0) {
        // Convert the testCounter to a Roman numeral
        const romanNumeral = romanize(testCounter);

        // Determine the display text based on question type
        let displayText = "";
        let instructions = "";
        if (questionType === "MultipleChoice") {
          displayText = "Multiple Choice";
          instructions =
            "Among the given OPTIONS in the questionnaire, choose the best option and write it in CAPITAL LETTER.";
        } else if (questionType === "TrueFalse") {
          displayText = "TRUE or FALSE";
          instructions =
            "Write T if the statement is TRUE or F if the statement is FALSE.";
        } else if (questionType === "Identification") {
          displayText = "Identification";
          instructions = "Write the ANSWER in CAPITAL LETTER.";
        }

        const score = questionsOfType[0].score;
        docx
          .createP()
          .addText(
            `TEST ${romanNumeral}. ${displayText} (${score} pts. each)`,
            {
              bold: true,
              fontSize: 16,
              color: "black",
            }
          );

        docx
          .createP()
          .addText(`Follow the directions and STRICTLY NO ERASURE.`);

        addStyledParagraph(instructions, {
          fontSize: 12,
          color: "black",
        });

        let questionNumber = 1; // Initialize question number

        questionsOfType.forEach((questionData, index) => {
          if (index > 0 && index % 10 === 0) {
            // Start a new page
            docx.createP().pageBreak();
          }

          addStyledParagraph(`${questionNumber}. ${questionData.question}`, {
            color: "black",
          });

          if (questionType === "MultipleChoice") {
            if (questionData.options && questionData.options.length > 0) {
              questionData.options.forEach((option, optionIndex) => {
                addStyledParagraph(
                  `  ${String.fromCharCode(97 + optionIndex)}.) ${option.text}`,
                  {
                    color: "black",
                  }
                );
              });
            }
          }

          questionNumber++; // Increment question number
        });

        testCounter++; // Increment testCounter for the next type
      }
    }

    // Pipe the Word document to the response stream for download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    docx.generate(res);
  } catch (error) {
    console.error("Error generating Word document:", error);
    res.status(500).send("Error generating Word document");
  }
});

app.get("/getquestionstypeandnumber/:TUPCID/:uid", async (req, res) => {
  const { TUPCID, uid } = req.params;

  try {
    // Construct the SQL query to retrieve the questions data
    const query = `
      SELECT questions
      FROM testpapers
      WHERE Professor_ID = ? AND UID_test = ?;
    `;

    // Execute the query with the provided parameters
    const [testdata] = await connection.query(query, [TUPCID, uid]);

    if (testdata.length >= 1) {
      console.log("Found test data for UID:", uid);

      // Extract questions data from the response
      const questionsData = testdata[0].questions;

      // Extract questionNumber and questionType from questionsData
      const questionNumbers = questionsData.map(
        (question) => question.questionNumber
      );
      const questionTypes = questionsData.map(
        (question) => question.questionType
      );

      // Construct the response object with questionNumber and questionType
      const responseData = {
        questionNumbers,
        questionTypes,
      };

      res.status(200).json(responseData);
    } else {
      console.log("Test data not found for UID:", uid);
      res.status(404).json({ error: "test data not found" });
    }
  } catch (error) {
    console.error("Error retrieving test data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/generateAnswerSheet/:uid/:sectionname/", async (req, res) => {
  try {
    const { uid, sectionname } = req.params; // Extract parameters from the URL

    console.log("uid:", uid);
    console.log("sectionname:", sectionname);
    // Fetch data from the database based on the parameters
    const query = `
      SELECT questions, test_name
      FROM testpapers
      WHERE UID_test = ?;
    `;

    const query2 = `
      SELECT e.Student_TUPCID, s.FIRSTNAME, s.MIDDLENAME, s.SURNAME
      FROM enrolled_sections e
      INNER JOIN student_accounts s ON e.Student_TUPCID = s.TUPCID
      WHERE e.section_name = ?;
    `;

    const query3 = `SELECT ;
  `;

    // Execute the first query to fetch data from 'testforstudents'
    const [testData] = await connection.query(query, [uid]);

    // Execute the second query to fetch data from 'enrollments' and 'student_accounts'
    const [studentData] = await connection.query(query2, [sectionname]);

    const test_name = testData[0].test_name;

    // Create a new PDF document
    const doc = new PDFDocument({
      size: "letter",
      margins: {
        top: 30,
        bottom: 10,
        left: 70,
        right: 20,
      },
    });
    const filename = `${test_name}.pdf`;

    // Define the box size and spacing
    const boxSize = 15;
    const boxSpacing = 1;
    const boxesPerQuestion = 10;

    // Define the line weight for boxes
    const boxLineWeight = 0.5;
    doc.fontSize(10);

    const boxStrokeColor = "#818582";

    // Iterate through studentData and add each student's information and answer sheet
    for (const student of studentData) {
      // Extract student information
      const { Student_TUPCID, FIRSTNAME, SURNAME } = student;

      // Define column widths and spacing
      const columnWidth = 200;
      doc.lineWidth(5);

      // First rectangle information
      doc.rect(70, 10, columnWidth + 299, 110).stroke();
      doc.text(`${Student_TUPCID}`, 90, 30, {
        width: columnWidth,
        align: "left",
        bold: true,
      });
      doc.text(`NAME: ${SURNAME}, ${FIRSTNAME}`, 90, 50, {
        width: columnWidth,
        align: "left",
        bold: true,
      });
      doc.text(`TESTNAME: ${test_name}  UID: ${uid}`, 150, 70, {
        width: columnWidth + 100,
        align: "center",
        bold: true,
      });

      const questionsData = testData[0].questions;
      const groupedQuestions = {};

      questionsData.forEach((item) => {
        const questionType = item.questionType;
        const type = item.type;

        if (questionType) {
          if (!groupedQuestions[questionType]) {
            groupedQuestions[questionType] = [];
          }
          groupedQuestions[questionType].push({
            questionNumber: item.questionNumber,
            type: item.type,
          });
        }
      });

      for (const questionType in groupedQuestions) {
        const questionsOfType = groupedQuestions[questionType];

        if (questionsOfType.length > 0) {
          // Determine the display text based on question type
          let displayText = ``;

          if (questionType === "MultipleChoice") {
            displayText = "MULTIPLE CHOICE";
          } else if (questionType === "TrueFalse") {
            displayText = "TRUE OR FALSE";
          } else if (questionType === "Identification") {
            displayText = "IDENTIFICATION";
          }

          let alignment = "left";
          if (questionsOfType[0].type === "TYPE 2") {
            typeoftest = "TYPE 2";
            alignment = "center";
          } else if (questionsOfType[0].type === "TYPE 3") {
            typeoftest = "TYPE 3";
            alignment = "right";
          }

          if (
            questionsOfType[0].type === "TYPE 1" &&
            questionType === "MultipleChoice"
          ) {
            doc
              .rect(70, 140, columnWidth - 100, 600)
              .stroke()
              .strokeColor("black");
          } else if (
            questionsOfType[0].type === "TYPE 1" &&
            questionType === "TrueFalse"
          ) {
            doc
              .rect(70, 140, columnWidth - 60, 600)
              .stroke()
              .strokeColor("black");
          } else if (
            questionsOfType[0].type === "TYPE 1" &&
            questionType === "Identification"
          ) {
            doc
              .rect(70, 140, columnWidth + 35, 600)
              .stroke()
              .strokeColor("black");
          }

          if (
            questionsOfType[0].type === "TYPE 2" &&
            questionType === "MultipleChoice"
          ) {
            doc
              .rect(70 + 165, 140, columnWidth - 60, 600)
              .stroke()
              .strokeColor("black");
          } else if (
            questionsOfType[0].type === "TYPE 2" &&
            questionType === "TrueFalse"
          ) {
            doc
              .rect(70 + 130, 140, columnWidth - 100, 600)
              .stroke()
              .strokeColor("black");
          } else if (
            questionsOfType[0].type === "TYPE 2" &&
            questionType === "Identification"
          ) {
            doc
              .rect(70 + 130, 140, columnWidth + 35, 600)
              .stroke()
              .strokeColor("black");
          }

          if (
            questionsOfType[0].type === "TYPE 3" &&
            questionType === "MultipleChoice"
          ) {
            doc
              .rect(70 + 330, 140, columnWidth - 60, 600)
              .stroke()
              .strokeColor("black");
          } else if (
            questionsOfType[0].type === "TYPE 3" &&
            questionType === "TrueFalse"
          ) {
            doc
              .rect(70 + 330, 140, columnWidth - 60, 600)
              .stroke()
              .strokeColor("black");
          } else if (
            questionsOfType[0].type === "TYPE 3" &&
            questionType === "Identification"
          ) {
            doc
              .rect(70 + 265, 140, columnWidth + 35, 600)
              .stroke()
              .strokeColor("black");
          }

          doc.lineWidth(5); // Set the line thickness back to the default value (adjust as needed)

          doc.text(`${displayText}`, 90, 100, {
            width: columnWidth + 220,
            align: alignment,
          });

          doc.moveDown(6);

          let questionNumber = 1;
          questionsOfType.forEach(() => {
            if (questionNumber <= 9) {
              if (questionType === "Identification") {
                doc.text(`${questionNumber}.  `, {
                  bold: true,
                  fontSize: 12,
                  width: columnWidth + 80,
                  align: alignment,
                });
              } else if (questionType === "TrueFalse") {
                doc.text(`${questionNumber}.   `, {
                  bold: true,
                  fontSize: 12,
                  width: columnWidth + 80,
                  align: alignment,
                });
              } else {
                doc.text(`${questionNumber}.    `, {
                  bold: true,
                  fontSize: 12,
                  width: columnWidth + 220,
                  align: alignment,
                });
              }
            }

            if (questionNumber >= 10) {
              if (questionType === "Identification") {
                doc.text(`${questionNumber}.  `, {
                  bold: true,
                  fontSize: 12,
                  width: columnWidth + 80,
                  align: alignment,
                });
              } else if (questionType === "TrueFalse") {
                doc.text(`${questionNumber}.   `, {
                  bold: true,
                  fontSize: 12,
                  width: columnWidth + 80,
                  align: alignment,
                });
              } else {
                doc.text(`${questionNumber}.    `, {
                  bold: true,
                  fontSize: 12,
                  width: columnWidth + 220,
                  align: alignment,
                });
              }
            }

            // BOXES
            if (
              questionType === "MultipleChoice" &&
              questionsOfType[0].type === "TYPE 1"
            ) {
              doc
                .rect(doc.x + 45 + boxSpacing, doc.y - 19.5, boxSize, boxSize)
                .lineWidth(boxLineWeight)
                .stroke("#adb8af")
                .strokeColor("black");
            } else if (
              questionType === "Identification" &&
              questionsOfType[0].type === "TYPE 1"
            ) {
              doc
                .rect(doc.x + 45, doc.y - 19.5, 140, boxSize)
                .lineWidth(boxLineWeight)
                .stroke("#adb8af")
                .strokeColor("black");
            } else if (
              questionType === "TrueFalse" &&
              questionsOfType[0].type === "TYPE 1"
            ) {
              doc
                .rect(doc.x + 45 + boxSpacing, doc.y - 19.5, boxSize, boxSize)
                .lineWidth(boxLineWeight)
                .stroke("#adb8af")
                .strokeColor("black");
            } else if (
              questionType === "MultipleChoice" &&
              questionsOfType[0].type === "TYPE 2"
            ) {
              doc
                .rect(doc.x + 175, doc.y - 19.5, boxSize, boxSize)
                .lineWidth(boxLineWeight)
                .stroke("#adb8af")
                .strokeColor("black");
            } else if (
              questionType === "Identification" &&
              questionsOfType[0].type === "TYPE 2"
            ) {
              doc
                .rect(doc.x + 175, doc.y - 19.5, 140, boxSize)
                .lineWidth(boxLineWeight)
                .stroke("#adb8af")
                .strokeColor("black");
            } else if (
              questionType === "TrueFalse" &&
              questionsOfType[0].type === "TYPE 2"
            ) {
              doc
                .rect(doc.x + 175, doc.y - 19.5, boxSize, boxSize)
                .lineWidth(boxLineWeight)
                .stroke("#adb8af")
                .strokeColor("black");
            } else if (
              questionType === "MultipleChoice" &&
              questionsOfType[0].type === "TYPE 3"
            ) {
              doc
                .rect(doc.x + 320, doc.y - 19.5, boxSize, boxSize)
                .lineWidth(boxLineWeight)
                .stroke("#adb8af")
                .strokeColor("black");
            } else if (
              questionType === "Identification" &&
              questionsOfType[0].type === "TYPE 3"
            ) {
              doc
                .rect(doc.x + 320, doc.y - 19.5, 140, boxSize)
                .lineWidth(boxLineWeight)
                .stroke("#adb8af")
                .strokeColor("black");
            } else if (
              questionType === "TrueFalse" &&
              questionsOfType[0].type === "TYPE 3"
            ) {
              doc
                .rect(doc.x + 320, doc.y - 19.5, boxSize, boxSize)
                .lineWidth(boxLineWeight)
                .stroke("#adb8af")
                .strokeColor("black");
            }

            doc.fill("black");
            doc.strokeColor("black");
            doc.moveDown(1.3);
            doc.lineWidth(5);
            questionNumber++;
          });
        }
      }
      doc.lineWidth(5);

      doc.moveDown(4);

      // Add a page break for the next student (except for the last one)
      if (student !== studentData[studentData.length - 1]) {
        doc.addPage();
      }
    }

    // Pipe the PDF to the response stream
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    doc.pipe(res);

    // Finalize the PDF and end the response stream
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
});

app.get('/getquestionstypeandnumberandanswer/:uid', async (req, res) => {
  const {  uid } = req.params;

  console.log("uid:", uid);
  

  try {
    // Construct the SQL query to retrieve the questions data
    const query = `
      SELECT questions
      FROM testpapers
      WHERE UID_test = ?;
    `;

    // Execute the query with the provided parameters
    const [testdata] = await connection.query(query, [ uid]);

    if (testdata.length >= 1) {
      console.log("Found test data for UID:", uid);

      // Extract questions data from the response
      const questionsData = testdata[0].questions;

      // Extract questionNumber, questionType, and answer from questionsData
      const questionNumbers = questionsData.map((question) => question.questionNumber);
      const questionTypes = questionsData.map((question) => question.questionType);
      const answers = questionsData.map((question) => question.answer);
      const score = questionsData.map((question) => question.score);
      const totalscore = questionsData.map((question) => question.TotalScore);

      const totalScoreValue = totalscore.filter(score => typeof score === 'number').pop();

console.log('Total Score:', totalScoreValue); 
      

      // Construct the response object with questionNumber, questionType, and answers
      const responseData = {
        questionNumbers,
        questionTypes,
        answers,
        score,
        totalScoreValue
      };

      res.status(200).json(responseData);
    } else {
      console.log("Test data not found for UID:", uid);
      res.status(404).json({ error: 'test data not found' });
    }
  } catch (error) {
    console.error('Error retrieving test data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/results', async (req, res) => {
  try {
    const { TUPCID, UID, questionType, answers } = req.body;

    // Insert data into the database
    const query = `
      INSERT INTO results
      (TUPCID, UID, questionType, answers, results_takendate) 
      VALUES (?, ?, ?, ?, NOW())
    `;

    const values = [
      TUPCID || null,
      UID || null,
      JSON.stringify(questionType), 
      JSON.stringify(answers),      
    ];

    await connection.query(query, values);

    // Respond with a success message
    res.status(200).json({ message: 'Data added to the database successfully' });
  } catch (error) {
    console.error('Error adding data to the database:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});


app.get('/getstudentanswers/:studentid/:uid', async (req, res) => {
  const { studentid, uid } = req.params;

  try {
    // Construct the SQL query to retrieve the student answers data
    const query = `
    SELECT answers
    FROM results
    WHERE TUPCID = ? AND UID = ?;
  `;

    // Execute the query with the provided parameters
    const [studentAnswerData] = await connection.query(query, [studentid, uid]);

    if (studentAnswerData.length >= 1) {
      console.log("Found student answer data for UID:", uid);
      console.log("Found student answer data for TUPCID:", studentid);

      // Extract student answers data from the response
      const studentAnswers = studentAnswerData[0].answers; 

      const questionNumbers = studentAnswers.map((answer) => answer.questionNumber);
      const questionTypes = studentAnswers.map((answer) => answer.type);
      const answers = studentAnswers.map((answer) => answer.answer);

      // Construct the response object with student answers
      const responseData = {
        questionNumbers,questionTypes, answers
      };
      console.log("check response:", responseData)
      res.status(200).json(responseData);
    } else {
      console.log("Student answer data not found for UID:", uid);
      res.status(404).json({ error: 'student answer data not found' });
    }
  } catch (error) {
    console.error('Error retrieving student answer data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get("/Studentname/:TUPCID", async (req, res) => {
  const { TUPCID } = req.params;
  try {
    const query = "SELECT FIRSTNAME, MIDDLENAME, SURNAME FROM student_accounts WHERE TUPCID = ?";
    const [studentData] = await connection.query(query, [TUPCID]);

    if (studentData.length > 0) {
      const {
        FIRSTNAME,
        SURNAME,
        MIDDLENAME
      } = studentData[0];

      return res.status(202).send({
        TUPCID,
        FIRSTNAME,
        SURNAME,
        MIDDLENAME,
      });
    } else {
      return res.status(404).send({ message: "Student not found" });
    }
  } catch (error) {
    return res.status(500).send({ message: "Failed to fetch student data" });
  }
});


// Start the server
app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
