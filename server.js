const express = require("express");
const cors = require("cors");
const mysql = require("mysql8");
const { format } = require("date-fns");

const app = express();
const PORT = process.env.PORT || 3001;

// MySQL database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Siraj@08122001",
  database: "yoga_classes",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

app.use(cors());
app.use(express.json());

const currentMonth = format(new Date(), "MM");

// Function to get user enrollment data
function getUserEnrollmentData(userEmail, callback) {
  // Query to get user data from the database
  const query = "SELECT submitted_month FROM users WHERE email = ?";

  db.query(query, [userEmail], (err, results) => {
    if (err) {
      console.error("Error fetching user enrollment data:", err);
      return callback(err, null);
    }

    if (results.length > 0) {
      const user = {
        enrollmentDate: new Date(results[0].submitted_month), // Using 'submitted_month' column
      };
      return callback(null, user); // Returning the user data
    } else {
      return callback(null, null); // Returning null if the user is not found
    }
  });
}

// Form submission route
app.post("/api/submitForm", (req, res) => {
  const { name, age, selectedBatch, email, phone } = req.body;

  const currentMonth = format(new Date(), "MM");

  const insertQuery =
    "INSERT INTO users (name, age, selected_batch, email, phone, submitted_month) VALUES (?, ?, ?, ?, ?, ?)";

  db.query(
    insertQuery,
    [name, age, selectedBatch, email, phone, currentMonth],
    (insertErr) => {
      if (insertErr) {
        console.error("Error inserting data into MySQL:", insertErr);
        return res.status(500).json({
          success: false,
          message: "Form submission failed. Please try again.",
        });
      }

      const success = Math.random() < 0.8;
      if (success) {
        return res.json({
          success: true,
          message: "Form submitted successfully!",
        });
      } else {
        return res.status(500).json({
          success: false,
          message: "Form submission failed. Please try again.",
        });
      }
    }
  );
});

app.get("/api/checkFormSubmission", (req, res) => {
  const userEmail = req.query.email; // Passing the user's email as a query parameter

  // Checking if a form has been submitted for the current month by the user
  const query = "SELECT COUNT(*) AS count FROM users WHERE email = ? AND submitted_month = ?";
  db.query(query, [userEmail, currentMonth], (err, results) => {
    if (err) {
      console.error("Error checking form submission:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    const formSubmitted = results[0].count > 0;
    res.json({ isSubmitted: formSubmitted });
  });
});

app.get("/", (_req, res) => {
  res.send("Welcome to the Yoga Classes Admission Form API");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});