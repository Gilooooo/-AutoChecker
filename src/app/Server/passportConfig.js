const connection = require("./database");
const localStrategy = require("passport-local").Strategy;

const bcrypt = require("bcrypt"); // Correct the typo in 'bcrpt'

const checkType = async (table, Tupcid, Password, accountType) => {
  try {
    const query = `SELECT * FROM ${table}_accounts WHERE TUPCID = ?`;
    const [rows] = await connection.query(query, [Tupcid]);
    if (rows.length === 0) {
      return { accountType: null };
    }
    const user = rows[0];

    const isPasswordMatch = await bcrypt.compare(Password, user.PASSWORD);
    if (isPasswordMatch) {
      return { accountType: accountType, uid: user.uid };
    } else {
      return { accountType: null };
    }
  } catch (error) {
    throw error;
  }
};

module.exports = function (passport) {
  passport.use(
    new localStrategy(async (Tupcid, Password, done) => {
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
          return done(null, studentLoginResult); // Success for student
        } else if (facultyLoginResult.accountType === "faculty") {
          return done(null, facultyLoginResult); // Success for faculty
        } else {
          return done(null, false, { message: "Incorrect credentials" }); // Authentication failed
        }
      } catch (error) {
        return done(error);
      }
    })
  );

  // Serialize user to store in session
  passport.serializeUser((user, done) => {
    done(null, user.uid);
  });

  // Deserialize user to retrieve user data from session
  passport.deserializeUser(async (uid, done) => {
    try {
      // Fetch user data from the database based on uid
      // Example: const user = await User.findById(uid);
      // Provide the user object to done
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};
