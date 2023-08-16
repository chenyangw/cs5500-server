import React, { useState, useEffect } from "react";
import Formula from "./Formula";
import Status from "./Status";
import KeyPad from "./KeyPad";
import SpreadSheetController from "../Engine/SpreadSheetController";
import SheetHolder from "./SheetHolder";
import SheetMemory from "../Engine/SheetMemory";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { ButtonNames } from "../Engine/GlobalDefinitions";
import Cell from "../Engine/Cell";
import FormulaBuilder from "../Engine/FormulaBuilder";

import { RandomAvatar } from "react-random-avatars";
import useWebSocket, { ReadyState } from "react-use-websocket";
import "./SpreadSheet.css";
import { useNavigate } from "react-router-dom";

// const WS_URL = "ws://127.0.0.1:8080";
const WS_URL = "ws://localhost:8080";
function isUserEvent(message: MessageEvent) {
  let evt = JSON.parse(message.data);
  return evt.type === "userevent";
}

/**
 * the main component for the Spreadsheet.  It is the parent of all the other components
 *
 *
 * */
// make this a variable so we can resize it later (this would necessitate a new machine)
//let spreadSheetController: SpreadSheetController = new SpreadSheetController(5, 8)

function SpreadSheet() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("");
  const [spreadSheetController, setSpreadSheetController] =
    useState<SpreadSheetController>();
  const [givenUserSheets, setGivenUserSheets] = useState([]);

  // Initialize state with default or empty values
  const [formulaString, setFormulaString] = useState("");
  const [resultString, setResultString] = useState("");
  const [cells, setCells] = useState<string[][]>([]);
  const [statusString, setStatusString] = useState("");
  const [currentCell, setCurrentCell] = useState("");
  const [currentlyEditing, setCurrentlyEditing] = useState(false);

  const [currentUserEditable, setCurrentUserEditable] = useState(false);

  // useEffect(() => {
  //   const intervalId = setInterval(async () => {
  //     const updatedSheetMemory = await getSheetMemoryFromDatabase();

  //     setCells(spreadSheetController?.getSheetDisplayStringsForGUI() || []);
  //     // re-render the component
  //     updateDisplayValues();
  //     console.log("rerender the component");

  //   }, 1000);
  //   return () => clearInterval(intervalId);

  // }, []);

  useEffect(() => {
    const { state } = location;
    const { userName, role, fetchedSheetMemoryData } = state;
    setUserName(userName);
    setRole(role);
    // use the fetchedSheetMemoryData to create a new sheetMemory
    const newSheetMemory = new SheetMemory(
      fetchedSheetMemoryData._numColumns,
      fetchedSheetMemoryData._numRows,
      fetchedSheetMemoryData._cells,
      fetchedSheetMemoryData._currentColumn,
      fetchedSheetMemoryData._currentRow,
      fetchedSheetMemoryData._ssId
    );
    const spreadSheetController = new SpreadSheetController(
      fetchedSheetMemoryData._numColumns,
      fetchedSheetMemoryData._numRows
    );
    spreadSheetController.setSheetMemory(newSheetMemory);
    setSpreadSheetController(spreadSheetController);
    //create a new formula builder and set it to the spreadSheetController
    const newFormulaBuilder = new FormulaBuilder(
      newSheetMemory.getCurrentCellFormula()
    );
    spreadSheetController.setFormulaBuilder(newFormulaBuilder);
    if (spreadSheetController !== undefined) {
      //console.log("the sheet in the useEffect is:", spreadSheetController.getCurrentCell());
      // Update the state values using the spreadSheetController data
      setFormulaString(spreadSheetController.getFormulaString());
      setResultString(spreadSheetController.getResultString());
      setStatusString(spreadSheetController.getEditStatusString());
      setCurrentCell(spreadSheetController.getCurrentCell().getLabel());
      setCells(spreadSheetController.getSheetDisplayStringsForGUI());
      setCurrentlyEditing(spreadSheetController.getEditStatus());
    } else {
      // SpreadSheetController is undefined, use default or empty values
      setFormulaString("");
      setResultString("");
      setStatusString("");
      setCells([]);
      setCurrentCell("");
      setCurrentlyEditing(false);
    }
  }, []);

  const { ssId } = useParams();

  async function updateDisplayValues(): Promise<void> {
    if (spreadSheetController === undefined) {
      setFormulaString("");
      setResultString("");
      setStatusString("");
      setCells([]);
      setCurrentCell("");
      setCurrentlyEditing(false);
    } else {
      // Update the state values using the spreadSheetController data
      //spreadSheetController.setSheetMemory(updatedSheetMemoryType)
      setFormulaString(spreadSheetController.getFormulaString());
      setResultString(spreadSheetController.getResultString());
      setStatusString(spreadSheetController.getEditStatusString());
      setCells(spreadSheetController.getSheetDisplayStringsForGUI());
      setCurrentCell(spreadSheetController.getCurrentCell().getLabel());
      //setCurrentCell(spreadSheetController.getWorkingCellLabel());
      setCurrentlyEditing(spreadSheetController.getEditStatus());
    }
  }

  /**
   * This function is to post the sheet memory to the backend
   *
   */
  const postCurrentCell = async () => {
    let currentCell: Cell | undefined = undefined;
    let currentColumn: number = 0;
    let currentRow: number = 0;
    if (spreadSheetController !== undefined) {
      currentCell = spreadSheetController.getCurrentCell();
    }
    //console.log("the current cell that is going to be posted is:", currentCell);

    try {
      const response = await fetch(`http://localhost:3005/sheet/${ssId}/edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentCell: currentCell,
          currentColumn: currentColumn,
          currentRow: currentRow,
        }),
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = await response.json();
      console.log("Success post the sheetMemory to the backend:", data);
    } catch (err) {
      console.log(err);
    }
  };

  const getSheetMemoryFromDatabase = async () => {
    try {
      const response = await fetch(`http://localhost:3005/sheets/${ssId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = await response.json();
      //console.log('new sheetmemory from the back:', data);
      return data;
    } catch (err) {
      console.log(err);
    }
  };

  /**
   * This function to post the editable of the current cell to the backend
   *
   */
  const postCellEditable = async () => {
    let currentCell: Cell | undefined = undefined;
    if (spreadSheetController !== undefined) {
      currentCell = spreadSheetController.getCurrentCell();
    }
    try {
      const response = await fetch(
        `http://localhost:3005/sheet/${ssId}/editcell`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentCell: currentCell,
          }),
        }
      );
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = await response.json();
      console.log("Success post the cell editable to the backend:", data);
      return data;
    } catch (err) {
      console.log(err);
    }
  };

  //unlock the cell by setting the editable in the cell to true
  const unlockCell = async () => {
    let currentCell: Cell | undefined = undefined;
    if (spreadSheetController !== undefined) {
      currentCell = spreadSheetController.getCurrentCell();
    }
    try {
      const response = await fetch(
        `http://localhost:3005/sheet/${ssId}/unlockcell`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentCell: currentCell,
          }),
        }
      );
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = await response.json();
      //console.log('Success post the cell unlock to the backend:', data);
      return data;
    } catch (err) {
      console.log(err);
    }
  };

  /**
   *
   * @param event
   *
   * This function is the call back for the command buttons
   *
   * It will call the machine to process the command button
   *
   * the buttons done, edit, clear, all clear, and restart do not require asynchronous processing
   *
   * the other buttons do require asynchronous processing and so the function is marked async
   */
  async function onCommandButtonClick(text: string): Promise<void> {
    switch (text) {
      case ButtonNames.edit_toggle:
        try {
          if (currentlyEditing) {
            console.log("is == here?");
            await postCurrentCell();
            await unlockCell();
            setCurrentUserEditable(false);
            spreadSheetController?.setEditStatus(false);
          } else {
            spreadSheetController?.setEditStatus(true);
          }
          // if the spreadSheetController is undefined, then use the default values
          if (spreadSheetController === undefined) {
            setStatusString("the spreadSheetController is undefined");
          } else {
            setStatusString(spreadSheetController?.getEditStatusString());
          }
        } catch (err) {
          console.log(err);
        }
        break;

      case ButtonNames.clear:
        spreadSheetController?.removeToken();
        break;

      case ButtonNames.allClear:
        spreadSheetController?.clearFormula();
        break;
    }
    // update the display values
    updateDisplayValues();
  }

  /**
   *  This function is the call back for the number buttons, the advanced calculation buttons and the Parenthesis buttons
   *
   * They all automatically start the editing of the current formula.
   *
   * @param event
   *
   * */
  async function onButtonClick(
    event: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> {
    const text = event.currentTarget.textContent;
    let trueText = text ? text : "";

    //console.log("the number or the parenthesis is clicked.....this should lock the cell")

    let cellEditable = await postCellEditable();
    let fetchedSheetMemoryData = await getSheetMemoryFromDatabase();
    // console.log("click the button, the sheet memory is:", fetchedSheetMemoryData);
    if (fetchedSheetMemoryData !== undefined) {
      const newSheetMemory = new SheetMemory(
        fetchedSheetMemoryData?._numColumns,
        fetchedSheetMemoryData?._numRows,
        fetchedSheetMemoryData?._cells,
        fetchedSheetMemoryData?._currentColumn,
        fetchedSheetMemoryData?._currentRow,
        fetchedSheetMemoryData?._ssId
      );
      spreadSheetController?.setSheetMemory(newSheetMemory);
    }

    await updateDisplayValues();
    //console.log("the current cell reditable:", cellEditable?.cellEditable);
    //let currentUserEditable = false;
    if (cellEditable?.cellEditable) {
      setCurrentUserEditable(true);
    }
    if (currentUserEditable) {
      spreadSheetController?.setEditStatus(true);
      spreadSheetController?.addToken(trueText);
    }
    //console.log("the current cell editStatus", currentUserEditable);
    updateDisplayValues();
  }

  /**
   *
   * @param event
   *
   * This function is called when a cell is clicked
   * If the edit status is true then it will send the token to the machine.
   * If the edit status is false then it will ask the machine to update the current formula.
   */
  async function onCellClick(
    event: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> {
    const cellLabel = event.currentTarget.getAttribute("cell-label");
    const editStatus = spreadSheetController?.getEditStatus();
    let realCellLabel = cellLabel ? cellLabel : "";

    let fetchedSheetMemoryData = await getSheetMemoryFromDatabase();
    //get the currrent cell column and row
    let currentColumn: number = 0;
    let currentRow: number = 0;
    if (realCellLabel !== "") {
      currentColumn = Cell.cellToColumnRow(realCellLabel)[0];
      currentRow = Cell.cellToColumnRow(realCellLabel)[1];
    }
    let cellEditable =
      fetchedSheetMemoryData?._cells[currentColumn][currentRow]._editable;
    if (cellEditable === false) {
      alert("This cell is not editable, please click on another cell");
      return;
    }
    if (editStatus) {
      //console.log("the current cell lable is,,,,,", currentCell);
      //console.log("the added cell lable is ", realCellLabel);
      let spreadSheetMemoryCheck = new SheetMemory(
        fetchedSheetMemoryData?._numColumns,
        fetchedSheetMemoryData?._numRows,
        fetchedSheetMemoryData?._cells,
        fetchedSheetMemoryData?._currentColumn,
        fetchedSheetMemoryData?._currentRow,
        fetchedSheetMemoryData?._ssId
      );
      let okToAdd = spreadSheetController
        ?.getCalculationManager()
        .okToAddNewDependency(
          currentCell,
          realCellLabel,
          spreadSheetMemoryCheck
        );
      //console.log("test ok to add ?", okToAdd);
      if (okToAdd === false) {
        alert("This cell will introduce a loop, please click on another cell");
      }

      if (realCellLabel !== "") {
        spreadSheetController?.addCell(realCellLabel);
      } // this will never be ""
      updateDisplayValues();
    }
    // if the edit status is false then set the current cell to the clicked on cell
    else {
      if (fetchedSheetMemoryData !== undefined) {
        const newSheetMemory = new SheetMemory(
          fetchedSheetMemoryData?._numColumns,
          fetchedSheetMemoryData?._numRows,
          fetchedSheetMemoryData?._cells,
          fetchedSheetMemoryData?._currentColumn,
          fetchedSheetMemoryData?._currentRow,
          fetchedSheetMemoryData?._ssId
        );
        spreadSheetController?.setSheetMemory(newSheetMemory);
        const newFormulaBuilder = new FormulaBuilder(
          newSheetMemory.getCurrentCellFormula()
        );
        spreadSheetController?.setFormulaBuilder(newFormulaBuilder);
        await updateDisplayValues();
      }
      if (realCellLabel !== "") {
        spreadSheetController?.setWorkingCellByLabel(realCellLabel);
      }
      updateDisplayValues();
    }
  }

  const { sendJsonMessage, readyState } = useWebSocket(WS_URL, {
    onOpen: () => {
      console.log("WebSocket connection established.");
    },
    share: true,
    filter: () => false,
    retryOnError: true,
    shouldReconnect: () => true,
  });

  useEffect(() => {
    if (userName && readyState === ReadyState.OPEN) {
      sendJsonMessage({
        userName,
        type: "userevent",
      });
    }
  }, [userName, sendJsonMessage, readyState]);

  const back = () => {
    console.log("user name is " + userName);
    fetch(`http://localhost:3005/user/${userName}`, {
      method: "GET",
    })
      //if the user name is not in the database, prompt the user to create a new user

      .then((response) => {
        console.log("the response is: ", response);
        if (!response.ok) {
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
          setGivenUserSheets(data._sheets);
          // link to the app page and display the user's history spreadsheets and the user info
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
      {/* <p>the ssId: {ssId}</p>
      <p>the UserName: {userName}</p>
      <p>the User's Role: {role}</p> */}
      <div className="row">
        <div className="column">
          <div>Class session ID: {userName}</div>
          <div> Spreadsheet ID: {ssId}</div>
        </div>
        <div className="column">
          <Users />
        </div>
        <div className="column">
          <button onClick={back}>Back</button>
          <button
            onClick={() => {
              navigate("/");
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <Formula
        formulaString={formulaString}
        resultString={resultString}
      ></Formula>
      <Status statusString={statusString}></Status>
      {
        <SheetHolder
          cellsValues={cells}
          onClick={onCellClick}
          currentCell={currentCell}
          currentlyEditing={currentlyEditing}
        ></SheetHolder>
      }
      <KeyPad
        onButtonClick={onButtonClick}
        onCommandButtonClick={onCommandButtonClick}
        currentlyEditing={currentlyEditing}
      ></KeyPad>
    </div>
  );
}

function Users() {
  const { lastJsonMessage } = useWebSocket(WS_URL, {
    share: true,
    filter: isUserEvent,
  });
  console.log("lastJsonMessage: ", lastJsonMessage);
  // parse users list
  const data = JSON.parse(JSON.stringify(lastJsonMessage));
  console.log("data: ", data);
  const users: any[] = data?.data.users || [];
  console.log("users: ", users);

  // find list of user.username
  const userList = Object.values(users).map((user) => user.userName);
  console.log("username list: ", userList);
  // list users key
  const connection = Object.keys(users);
  console.log("current connected: ", connection);

  return (
    <div>
      {/* <span>Connected: </span> */}
      {connection.map((user) => (
        <span key={user}>
          <span id={user} key={user}>
            {/* <Avatar name={user} size="40" round="20px" /> */}
            <RandomAvatar name={user} size={40} />
          </span>
        </span>
      ))}
    </div>
  );
}

export default SpreadSheet;
