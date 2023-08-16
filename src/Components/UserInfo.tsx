import React from 'react'
import './UserInfo.css';
import { useNavigate } from 'react-router-dom';

// interface UserInfoProps {

//       userName: string;
//       role: string;
//   }

export default function UserInfo(userInfo: any) {
    //console.log("the user info is: ", userInfo.userInfo.userName, userInfo.userInfo.role);
    const navigate = useNavigate(); 

    const onClickLogOut = () => {
        console.log("clicked on log out");
        //TODO
        // remove user from local storage   
        //navigate to the home page 
        navigate("/");
    }
  return (
    <div>
        <div className="user">USER INFO</div>
        <div>SESSION: {userInfo.userInfo.userName}</div>
        {/* <div>ROLE:{userInfo.userInfo.role}</div> */}
        <button 
            className="logOutButton"
            onClick={onClickLogOut}
        >
            LOG OUT
        </button>
    </div>
  )
}
