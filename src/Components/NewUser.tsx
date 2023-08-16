import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NewUser.css";
import "./GlobalStyle.css";
import database from "../database";
import User from "../User";
import path from "path";

export default function NewUser() {
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("Student"); // default role is student

  const navigate = useNavigate();

  //link to the app page
  const onClickStartNow = () => {
    // check if user name is empty
    // if empty, pop up a message "Please enter a username"
    // else, create user and add it to database
    if (userName === "") {
      alert("Please enter a username");
      return;
    }

    onClickCreateUser();

    navigate("/app", { state: { userName: userName, role: role } });
    //navigate(`/app?username=${userName}`)
  };

  // onClickCreateUser
  // create user and add it to database
  const onClickCreateUser = () => {
    console.log(`Creating user: ${userName}`);
    fetch("http://localhost:3005/create-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: userName, role: role }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("User created:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <>
      <div className="newUserContainer">
        <p className="title">Create New Session</p>
        <input
          className="textInput"
          type="text"
          placeholder="Enter a session name"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setUserName(e.target.value);
          }}
        />
        <div className="optionsContainer">
          <span className="textRole">Choose your role</span>
          <select onChange={(e) => setRole(e.target.value)}>
            <option value="Teacher">Teacher</option>
            <option selected value="Student">
              Student
            </option>
          </select>
        </div>
        <button className="buttonWiderinBlue" onClick={onClickStartNow}>
          START NOW!
        </button>
      </div>
    </>
  );
}
