import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./AdmissionForm.css";

const AdmissionForm = () => {
  const getCurrentMonth = () => {
    const currentDate = new Date();
    return currentDate.getMonth() + 1; // Adding 1 because months are zero-indexed in JavaScript
  };

  const getUserEnrollmentMonth = (user) => {
    return user && user.enrollmentMonth ? user.enrollmentMonth : 1; // Default to 1 if not available
  };
  
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [enrollmentMonth] = useState(getUserEnrollmentMonth());
  const [currentMonth] = useState(getCurrentMonth());
  const [canChangeBatch, setCanChangeBatch] = useState(false);

  useEffect(() => {
    const checkFormSubmission = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/api/checkFormSubmission"
        );
        const data = await response.json();
        setIsFormSubmitted(data.isSubmitted);
      } catch (error) {
        console.error("Error checking form submission:", error);
      }
    };

    checkFormSubmission();
    setCanChangeBatch(currentMonth > enrollmentMonth);
  }, [currentMonth, enrollmentMonth]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isFormSubmitted) {
      setError("You have already submitted the form for this month.");
      return;
    }

    // Validation check
    if (!name || !age || !selectedBatch || !email || !phone) {
      setError("Please fill in all fields.");
      return;
    }

    if (isNaN(age) || age < 18 || age > 65) {
      setError("Please enter a valid age between 18 and 65.");
      return;
    }

    // Additional Regex validation for email and phone number
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!phoneRegex.test(phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    // Resetting the error and success message
    setError("");
    setSuccessMessage("");

    // Making API call to the backend
    try {
      const response = await fetch("http://localhost:3001/api/submitForm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, age, selectedBatch, email, phone }),
      });

      const data = await response.json();

      // Handling the response from the API
      if (data.success) {
        setSuccessMessage("Form submitted successfully!");
      } else {
        setError("Form submission failed. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Form submission failed. Please try again.");
    }
  };

  return (
    <div className="admission-form-container">
      <h1>Yoga Classes Admission Form</h1>
      <form onSubmit={handleSubmit} className="form">
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="age">Age:</label>
          <input
            type="number"
            id="age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="batch">Preferred Batch:</label>
          <select
            id="batch"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            required
            disabled={!canChangeBatch}
          >
            <option value="">Select Batch</option>
            <option value="6-7AM">6-7AM</option>
            <option value="7-8AM">7-8AM</option>
            <option value="8-9AM">8-9AM</option>
            <option value="5-6PM">5-6PM</option>
          </select>
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="phone">Phone:</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div className="error-message">{error}</div>
        <div className="success-message">{successMessage}</div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(<AdmissionForm />);