import { useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import "./GlobalStyle.css";
import User from "../User";
import Database from "../database";

// click the NEW USER button, then link to another page NewUser.tsx

export default function Home() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");

  // const [givenUserName, setGivenUserName] = useState("");
  // const [givenUserId, setGivenUserId] = useState("");
  // const [givenUserRole, setGivenUserRole] = useState("");
  const [givenUserSheets, setGivenUserSheets] = useState([]);

  const db = new Database();
  // TODO
  // server request to get the user list into the database

  const onClickNewUser = () => {
    //link to another page
    navigate("/newuser");
  };

  //click enter button, check if the user name is already in the database, if not, prompt the user to create a new user
  //if the user name is already in the database, link to the app page and display the user's history spreadsheets and the user info
  const onClickEnter = () => {
    console.log("user name is " + userName);
    fetch(`http://localhost:3005/user/${userName}`, {
      method: "GET",
    })
      //if the user name is not in the database, prompt the user to create a new user

      .then((response) => {
        console.log("the response is: ", response);
        if (!response.ok) {
          //throw new Error('Network response was not ok');
          alert("ID does not exist, please create a new session");
        }
        return response.json();
      })
      .then((data) => {
        console.log("User found:", data._username, data._role, data._sheets);

        if (data === null) {
          // prompt the user to create a new user
          console.log("user not found");
          alert("user not found, navigate to new user page");
          //navigate("/newuser");
          return;
        } else {
          // setGivenUserName(data._username);
          // setGivenUserId(data._id);
          // setGivenUserRole(data._role);
          setGivenUserSheets(data._sheets);
          // link to the app page and display the user's history spreadsheets and the user info
          //console.log("the user name is: ", givenUserName, givenUserRole);
          navigate("/app", {
            state: {
              userName: data._username,
              role: data._role,
              sheets: data._sheets,
            },
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <div>
      <div className="homeContainer">
        <p className="title">CLASS SESSION ID</p>
        <div>
          <input
            type="text"
            className="textInput"
            placeholder="Class session ID"
            onChange={(e) => {
              setUserName(e.target.value);
            }}
          />
          <button className="buttonWideInPurple" onClick={onClickEnter}>
            ENTER
          </button>
        </div>
        <button className="buttonWiderinBlue" onClick={onClickNewUser}>
          NEW SESSION
        </button>
      </div>
    </div>
  );
}
