/**
 * @jest-environment jsdom
 */

import React, { useState, useEffect } from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";
import SpreadSheet from "./Components/SpreadSheet";
import NumberInputWithButtons from "./Components/NumberInputWithButtons";
import "./Components/GlobalStyle.css";
import UserInfo from "./Components/UserInfo";
import { useLocation } from "react-router-dom";
import SheetMemory from "./Engine/SheetMemory";
import SpreadSheetController from "./Engine/SpreadSheetController";

interface UserState {
  userName: string;
  role: string;
  sheets: [];
}

function App() {
  const location = useLocation();
  const { userName, role, sheets }: UserState = location.state || {};
  //console.log("the data from the new user page is: ", userName, role, sheets);

  const navigate = useNavigate();

  const [row, setRow] = useState(1);
  const [column, setColumn] = useState(1);
  //if the sheets is empty, set the sheetIdList to empty array
  const [sheetIdList, setSheetIdList] = useState<string[]>([]);
  //const [sheetMemory, setSheetMemory] = useState<SheetMemory>(new SheetMemory(column, row));
  //const [sheetController, setSheetController] = useState<SpreadSheetController>(new SpreadSheetController(column || 3, row || 8, sheetMemory || undefined));

  //console.log("the sheet list is: ", sheetList);

  // useEffect to set the sheetIdList, if the sheets is empty, or the sheets is undefied, set the sheetIdList to empty array
  // else set the sheetIdList to the sheets.map((item: any) => item._ssId)
  useEffect(() => {
    if (sheets === undefined || sheets.length === 0) {
      setSheetIdList([]);
    } else {
      let reuslt = sheets.map((item: any) => item._ssId);
      console.log(reuslt);
      setSheetIdList(sheets.map((item: any) => item._ssId));
    }
  }, [sheets]);

  const handleInputRowVaule = (value: number) => {
    setRow(value);
  };

  const handleInputColumnVaule = (value: number) => {
    setColumn(value);
  };

  //navigate to the spread sheet page
  const onClickOnSpreadSheet = async (ssId: string) => {
    console.log("clicked on spread sheet");
    const fetchedSheetMemoryData = await fetchSheetMemory(ssId);
    //console.log("the fetched sheet memory data is: ", fetchedSheetMemoryData);
    navigate(`/spreadsheet/${ssId}`, {
      state: { userName, role, fetchedSheetMemoryData },
    });
  };

  const fetchSheetMemory = async (ssId: string) => {
    try {
      const response = await fetch(`http://localhost:3005/sheets/${ssId}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("the sheet data from the backend:", data);
      return data;
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const createNewSheet = async () => {
    try {
      const response = await fetch("http://localhost:3005/create-sheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: userName, row: row, column: column }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      //console.log('the new sheetlist data from the backend:', data);
      setSheetIdList([...sheetIdList, data.newSheet._ssId]);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const onNewSheetClick = async () => {
    console.log("clicked on new sheet");
    await createNewSheet();
    // fetch("http://localhost:3005/create-sheet", {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({"username":userName, "row":row, "column":column})
    //   })
    //   .then(response => {
    //     if (!response.ok) {
    //       throw new Error('Network response was not ok');
    //     }
    //     return response.json();
    //   }
    //   )
    //   .then(data => {
    //     console.log('the new sheetlist data from the backend:', data.newSheet._ssId);
    //     //setSheetIdList(data.userSheets.map((item: any) => item._ssId));
    //     setSheetIdList([...sheetIdList, data.newSheet._ssId]);
    //   }
    //   )
    //   .catch(error => {
    //     console.error('Error:', error);
    //   }
    //   );
  };

  return (
    <div className="appContainer">
      <div className="leftContainer">
        <div className="createNewSheet">
          <div>
            <p>Row:</p>{" "}
            <NumberInputWithButtons getInput={handleInputColumnVaule} />
          </div>
          <div>
            <p>Column:</p>{" "}
            <NumberInputWithButtons getInput={handleInputRowVaule} />
          </div>
          <button className="buttonWiderinBlue" onClick={onNewSheetClick}>
            New Sheet
          </button>
        </div>
        <div>
          <p className="title">YOUR SPREADSHEETS</p>
          <div className="spreadsheetsbuttonsContainer">
            {sheetIdList && (
              <ul>
                {sheetIdList.map((item, index) => (
                  <li key={index}>
                    <button onClick={() => onClickOnSpreadSheet(item)}>
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="App">
          {/* <header className="App-header">
            <SpreadSheet />
          </header> */}
        </div>
      </div>
      <div className="rightContainer">
        <div className="userInfo">
          <UserInfo userInfo={{ userName, role }} />
        </div>
      </div>
    </div>
  );
}

export default App;
