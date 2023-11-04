const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
const expressSession = require("express-session");
const cookieParser = require("cookie-parser");
const bcryptjs = require("bcryptjs");
const connection = require("./database");
const nodemailer = require("nodemailer");

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
const getInfoProf = async (UidProf) => {
  try {
    const query =
    "SELECT SUBJECTDEPT, SURNAME, FIRSTNAME, MIDDLENAME, TUPCID FROM faculty_accounts WHERE uid = ?";
  const [row] = await connection.query(query, [UidProf]);
  return row;
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
}
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
    const query = "SELECT Uid_Account, Password FROM admin_account WHERE Account_Number = ?";
    const [row] = await connection.query(query, [Account_Number]);
    const hash = await bcryptjs.compare(Password, row[0].Password);
    if (hash) {
      const { Uid_Account } = row[0];
      return res.status(200).send({ Uid_Account });
    } else {
      return res.status(204).send({ message: "Wrong Password" });
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

app.get("/Admin_FacultyTestList", async(req, res) => {
  try {
    const query = "SELECT Professor_FirstName, Professor_MiddleName, Professor_LastName, Professor_SubjectDept, Professor_ID, TestName, Subject, Section_Name, Uid_Test FROM faculty_testlist";
    const [row] = await connection.query(query);
    return res.status(200).json(row);
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
})

//Admin
app.get("/AdminAside", async(req, res) => {
  const {Uid_Account} = req.query; 
  try {
    const query = "SELECT Account_Number, Username FROM admin_account WHERE Uid_Account = ?";
    const [row] = await connection.query(query, [Uid_Account]);
    return res.status(200).json(row);
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
})

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

//Settings
//Faculty
app.get("/FacultySettings", async (req, res) => {
  const { UidProf } = req.query;

  try {
    const query = "SELECT * FROM faculty_accounts WHERE uid = ?";
    const [row] = await connection.query(query, [UidProf]);

    return res.status(200).json(row);
  } catch (err) {
    throw err;
  }
});

app.get("/StudentSettings", async (req, res) => {
  const { Tupcid } = req.query;
  try {
    const query = "SELECT * FROM student_accounts WHERE uid = ?";
    const [row] = await connection.query(query, [Tupcid]);
    return res.status(200).json(row);
  } catch (err) {
    throw err;
  }
});

// FacultyTestList
app.get("/TestListSectionName", async (req, res) => {
  const { UidProf } = req.query;
  try {
    const query =
      "SELECT Subject, Section_Name FROM faculty_sections WHERE Uid_Professor = ?";
    const [section_names] = await connection.query(query, [UidProf]);
    return res.status(200).json(section_names);
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
  }
});
app.post("/TestList", async (req, res) => {
  const { TestName, Subject, UidTest, UidProf, SectionName } = req.body;
  try {
    const infos = await getInfoProf(UidProf);
    const query1 =
      "INSERT INTO faculty_testlist (Professor_FirstName, Professor_MiddleName, Professor_LastName, Professor_SubjectDept, Professor_ID, TestName, Subject, Section_Name, Uid_Test, Uid_Professor, date_created) values (?, ? ,? ,?, ?, ?, ?, ?, ?, ?, NOW())";
    const query2 =
      "INSERT INTO preset_faculty_testlist (Professor_FirstName, Professor_MiddleName, Professor_LastName, Professor_SubjectDept, Professor_ID, TestName, Subject, Section_Name, Uid_Test, Uid_Professor, date_created) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
    await connection.query(query1, [
      infos[0].FIRSTNAME,
      infos[0].MIDDLENAME,
      infos[0].SURNAME,
      infos[0].SUBJECTDEPT,
      infos[0].TUPCID,
      TestName,
      Subject,
      SectionName,
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
      UidTest,
      UidProf,
    ]);
    return res.status(200).send({ message: "done" });
  } catch (err) {
    throw err
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

app.delete("/TestList", async (req, res) => {
  const { UidTest } = req.query;
  try {
    const query = "DELETE FROM faculty_testlist WHERE Uid_Test = ?";
    await connection.query(query, [UidTest]);
    return res.status(200).send({ message: "Done" });
  } catch (err) {
    return res.status(500).send({ message: "Internal server error" });
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
    const query = "SELECT * FROM enrolled_sections WHERE Section_Uid = ? AND Section_Name = ? ";
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
    await connection.query(query,[...selected, Professor_Uid, Uid_Section, Section])
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
  const { Uid_Professor, Uid_Section, Section_Name } = req.body;
  try {
    const StudentName = await getInfo(uidStudent);
    const checking = await checkExist(uidStudent, Uid_Professor, Uid_Section);
    if (checking) {
      const query =
        "INSERT INTO enrolled_sections (Student_TUPCID, Student_FirstName,  Student_MiddleName, Student_LastName, Student_Uid, Professor_Uid, Section_Uid, Section_Name, date_added) values (?, ?, ?, ?, ?, ? ,? ,?, NOW())";
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
      ]);
      return res.status(200).send({ message: "Inserted" });
    } else {
      return res.status(409).send({ message: "Already enrolled" });
    }
  } catch (err) {
    throw err
  }
});

// Start the server
app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
