import express from "express";
import bodyParser from "body-parser";
import Database from "./database";
import Cell from "./Engine/Cell";
import User from "./User";
import SheetMemory from "./Engine/SheetMemory";
import { WebSocket, WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
import dns from "dns";
// import dotenv from "dotenv";
const dotenv = require("dotenv");
dotenv.config({ path: __dirname + "/.env" });

var cors = require("cors");

const app = express();
app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(cors());

const fs = require("fs");
const db = new Database();

const SERVER_PORT = 3005;
app.listen(SERVER_PORT, () => {
  console.log(`Listening on port: ${SERVER_PORT}`);
});
// log current host ipv4 address
const os = require("os");
const interfaces = os.networkInterfaces();
const en0 = interfaces.en0.find((iface: any) => iface.family === "IPv4");
if (en0) {
  console.log(`IPv4 address of en0: ${en0.address}`);
} else {
  console.log("en0 interface not found");
}

app.get("/", (req, res) => {
  // const str = JSON.stringify(process.env);
  // str pretty print
  const str = JSON.stringify(process.env, null, 4);

  res.send("<p>Hello World!</p><p>address: " + en0.address + "</p>");
});

// Set up WebSocket server
const wss = new WebSocketServer({ port: 8080 });

// Handle WebSocket connections
wss.on("connection", (connection: WebSocket) => {
  // Generate a unique code for every user
  const userId = uuidv4();
  console.log(`Received a new connection userID=`, userId);

  // Store the new connection and handle messages
  clients[userId] = connection as Client;
  console.log(`${userId} connected.`);

  connection.onmessage = function (event) {
    console.log("event.data", event.data);
    const dataFromClient = JSON.parse(event.data.toString());
    const json: JsonData = { type: dataFromClient.type };
    if (dataFromClient.type === typesDef.USER_EVENT) {
      users[userId] = dataFromClient;
      userActivity.push(
        `${dataFromClient.username} joined to edit the spreadsheet`
      );
      json.data = { users, userActivity };
    } else if (dataFromClient.type === typesDef.CONTENT_CHANGE) {
      editorContent = dataFromClient.content;
      json.data = { userActivity, editorContent: String(editorContent) };
    }
    broadcastMessage(json);
  };
  connection.onclose = function (event) {
    console.log(event);
    console.log(`${userId} disconnected.`);
    const json: JsonData = { type: typesDef.USER_EVENT };
    const username = users[userId]?.username || userId;
    userActivity.push(`${username} left the spreadsheet`);
    json.data = { users, userActivity };
    delete clients[userId];
    delete users[userId];
    broadcastMessage(json);
  };
});

//some helper functions
function broadcastMessage(json: JsonData) {
  // We are sending the current data to all connected clients
  // const data = JSON.stringify(json);
  for (let userId in clients) {
    let client = clients[userId];
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(json));
    }
  }
}
interface Client extends WebSocket {
  username: string;
}

const clients: { [key: string]: Client } = {};
const users: { [key: string]: User } = {};
// The current editor content is maintained here.
let editorContent = "";
// User activity history.
let userActivity: string[] = [];

// Event types
const typesDef = {
  USER_EVENT: "userevent",
  CONTENT_CHANGE: "contentchange",
};
interface JsonData {
  type: string;
  data?: {
    users?: { [key: string]: { username: string } };
    userActivity?: string[];
    editorContent?: string;
  };
}

//read the users.json file and return the users array
function readUsersFile(): User[] {
  const path = require("path");
  //const fileName = 'users.json';
  const fileName = path.join(__dirname, "users.json");
  let data = fs.readFileSync(fileName, "utf8");
  //console.log("the data read from the file is:", data)
  //check if the data is empty
  let result: User[] = [];
  if (data === undefined || data === "") {
    return result;
  } else {
    let parsedData = JSON.parse(data);

    let finalData = parsedData.map((user: any) => {
      let parsedSheets = user._sheets.map((sheet: any) => {
        return new SheetMemory(
          sheet._numColumns,
          sheet._numRows,
          sheet._cells,
          sheet._currentColumn,
          sheet._currentRow,
          sheet._ssId
        );
      });
      return new User(user._username, user._role, user._userId, parsedSheets);
    });
    return finalData;
  }
}

/**
 * write the users.json file
 * @param users the users array
 *
 */
function writeUsersFile(users: any) {
  const path = require("path");
  //const fileName = 'users.json';
  const fileName = path.join(__dirname, "users.json");
  fs.writeFile(fileName, JSON.stringify(users), (err: any) => {
    if (err) {
      console.error("Error writing file:", err);
      //res.status(500).send('Error writing file');
    } else {
      console.log("updated users.json");
    }
  });
}
// create a new user
app.post("/create-user", (req, res) => {
  console.log("here?");
  const newUserName = req.body.username;
  const role = req.body.role;
  let newUser = new User(newUserName, role);
  let users = readUsersFile();
  users.push(newUser);
  writeUsersFile(users);
  res.json(newUser);
});

app.post("/create-sheet", (req, res) => {
  const userName = req.body.username;
  const row = req.body.row;
  const column = req.body.column;
  console.log("the column and the row are:", column, row);
  //find the user in the users.json
  let users = readUsersFile();
  let user = users.find((user: User) => user.username === userName);

  if (user === undefined) {
    throw new Error("User not found");
  }
  // create a new spresdsheet and write it to the user
  let newSheet = new SheetMemory(row, column);
  user.addSheet(newSheet);
  //update the users.json
  writeUsersFile(users);
  //return the new sheet to the front end
  res.json({ newSheet: newSheet, userSheets: user.sheets });
});

//get the list of sheets with a certain user
app.get("/user/:username", (req, res) => {
  const userName = req.params.username;
  console.log("username:", userName);
  console.log(`GET /user/${userName}`);
  //let user = db.getUser(id);
  //let userSheets = db.getUserSheets(id);
  let users = readUsersFile();
  console.log("users:", users);
  let user = users.find((user: any) => user._username === userName);
  console.log("user:", user);
  if (user) {
    res.json(user);
  } else {
    res.status(404).send(`User ${userName} not found`);
  }
});

//get the sheet with a certain ssid
app.get("/sheets/:ssid", (req, res) => {
  //console.log("here?")
  const ssid = req.params.ssid;
  //console.log( `GET /sheet/${ssid}`);
  let users = readUsersFile();
  //let allSheets: SheetMemory[] = [];
  let resultSheet: SheetMemory | undefined;
  users.forEach((user: User) => {
    user.sheets.forEach((sheet: SheetMemory) => {
      if (sheet.getId() === ssid) {
        resultSheet = sheet;
      }
    });
  });
  //console.log("resultSheet:", resultSheet)
  if (resultSheet === undefined) {
    throw new Error("Sheet not found");
  } else {
    res.json(resultSheet);
  }
});

app.post("/sheet/:ssId/edit", (req, res) => {
  const ssid = req.params.ssId;
  const currentCell = req.body.currentCell;
  // // Read users data from file
  let users = readUsersFile();

  // Find the sheet with the specified ssId
  let resultSheet: SheetMemory | undefined;
  users.forEach((user: User) => {
    user.sheets.forEach((sheet: SheetMemory) => {
      if (sheet.getId() === ssid) {
        resultSheet = sheet;
      }
    });
  });

  // Check if the sheet was found
  if (resultSheet === undefined) {
    throw new Error("Sheet not found");
  } else {
    // Write updated users data back to file
    let currentCellLabel = currentCell._label;
    resultSheet.setWorkingCellByLabel(currentCellLabel);
    let newCell = new Cell(
      undefined,
      currentCell._formula,
      currentCell._value,
      currentCell._error,
      currentCell._displayString,
      currentCell._dependsOn,
      currentCell._label,
      currentCell._editable
    );
    resultSheet.setCurrentCell(newCell);
    writeUsersFile(users);
    // Send the updated sheet data as response
    res.json(resultSheet);
  }
});

//change the editCell's editable to false
app.post("/sheet/:ssId/editcell", (req, res) => {
  console.log("here?");
  const ssid = req.params.ssId;
  const currentCell = req.body.currentCell;
  // find the sheet with the specified ssid
  let users = readUsersFile();
  let resultSheet: SheetMemory | undefined;
  users.forEach((user: User) => {
    user.sheets.forEach((sheet: SheetMemory) => {
      if (sheet.getId() === ssid) {
        resultSheet = sheet;
      }
    });
  });

  // check if the sheet was found
  if (resultSheet === undefined) {
    console.log("Sheet not found");
  } else {
    let currentCellLabel = currentCell._label;
    resultSheet.setWorkingCellByLabel(currentCellLabel);
    //if the currentcell's editable is true change it to false
    // Ensure _editable is a boolean
    let currentCellInSheet = resultSheet.getCurrentCell();
    console.log("the current cell is:", currentCell);
    if (currentCellInSheet.getEditable() === true) {
      console.log(
        "in server, the editable is true",
        currentCellInSheet.getEditable()
      );
      currentCellInSheet.setEditable(false);
      let newCell = new Cell(
        undefined,
        currentCell._formula,
        currentCell._value,
        currentCell._error,
        currentCell._displayString,
        currentCell._dependsOn,
        currentCell._label,
        currentCellInSheet.getEditable()
      );
      resultSheet.setCurrentCell(newCell);

      //console.log("the result sheet is:", users[0].sheets[1].getCurrentCell())
      writeUsersFile(users);
      res.json({ cellEditable: true });
    } else {
      console.log(
        "in server, the editable is false",
        currentCellInSheet.getEditable()
      );
      res.json({ cellEditable: false });
      console.log("Editable property is not a boolean");
    }
  }
});

//unlock the cell
app.post("/sheet/:ssId/unlockcell", (req, res) => {
  const ssid = req.params.ssId;
  const currentCell = req.body.currentCell;
  // find the sheet with the specified ssid
  let users = readUsersFile();
  let resultSheet: SheetMemory | undefined;
  users.forEach((user: User) => {
    user.sheets.forEach((sheet: SheetMemory) => {
      if (sheet.getId() === ssid) {
        resultSheet = sheet;
      }
    });
  });

  // check if the sheet was found
  if (resultSheet === undefined) {
    console.log("Sheet not found");
  } else {
    let currentCellLabel = currentCell._label;
    resultSheet.setWorkingCellByLabel(currentCellLabel);
    //if the currentcell's editable is false change it to true
    let currentCellInSheet = resultSheet.getCurrentCell();
    console.log("the current cell is:", currentCell);
    if (currentCellInSheet.getEditable() === false) {
      console.log(
        "in server, the editable is false",
        currentCellInSheet.getEditable()
      );
      currentCellInSheet.setEditable(true);
      let newCell = new Cell(
        undefined,
        currentCell._formula,
        currentCell._value,
        currentCell._error,
        currentCell._displayString,
        currentCell._dependsOn,
        currentCell._label,
        currentCellInSheet.getEditable()
      );
      resultSheet.setCurrentCell(newCell);

      //console.log("the result sheet is:", users[0].sheets[1].getCurrentCell())
      writeUsersFile(users);
      res.json({ cellEditable: false });
    } else {
      console.log(
        "in server, the editable is false",
        currentCellInSheet.getEditable()
      );
      res.json({ cellEditable: true });
      console.log("Editable property is not a boolean");
    }
  }
});

//create a new sheet with a certain user
// app.get('user:userid/newsheet', (req, res) => {
//     const id = req.params.userid;
//     console.log( `GET /user/${id}/newsheet`);
//     let user = db.getUser(id);
//     if (user) {
//         let sheet = user.createSheet(5, 8); // default row 5 column 8 for now
//         res.json(sheet);
//     } else {
//         res.status(404).send(`User ${id} not found`);
//     }
// });

// app.get('/sheetid:ssid', (req, res) => {
//     const ssid = req.params.ssid;
//     let spreadsheet = db.getSheetById(ssid);
//     if (spreadsheet) {
//         res.json(spreadsheet);
//     } else {
//         res.status(404).send(`Spreadsheet ${ssid} not found`);
//     }
//     console.log( `GET /spreadsheet/${ssid}`);
// });

// app.get('/spreadsheet:ssid/cell:cellLabel/edit', (req, res) => {
//     const ssid = req.params.ssid;
//     const cellLabel = req.params.cellLabel;
//     console.log( `GET /spreadsheet/${ssid}/cell/${cellLabel}/edit`);
//     let spreadsheet = db.getSheetById(ssid);
//     if (spreadsheet) {
//         const currentCell = spreadsheet.getCellByLabel(cellLabel);
//         if (currentCell) {
//             if (currentCell.getEditable()) {
//                 res.json({ canEdit: true });
//                 currentCell.setEditable(false);
//             }
//             else {
//                 res.json({ canEdit: false });
//             }
//         }
//         else {
//             res.status(404).send(`Cell ${cellLabel} not found`);
//         }

//     } else {
//         res.status(404).send(`Spreadsheet ${ssid} not found`);
//     }
// });

//change the value of the table
// app.post('/spreadsheet:ssid', (req, res) => {
//     const ssid = req.params.ssid;
//     const currentCellLabel = req.body.currentCell;
//     const cellValues = req.body.cellValues;
//     const cellFormula = req.body.cellFormula;

//     console.log( `currentCell: ${currentCellLabel}`);
//     console.log( `cellValues: ${cellValues}`);
//     console.log( `cellFormula: ${cellFormula}`);

//     let spreadsheet = db.getSheetById(ssid);
//     if (spreadsheet === undefined) {
//         throw new Error(`Spreadsheet ${ssid} not found`);
//     }
//     else {
//         spreadsheet.setWorkingCellByLabel(currentCellLabel);
//         spreadsheet.setCurrentCellFormula(cellFormula);
//         spreadsheet.setCurrentCellValue(cellValues);

//         res.json(spreadsheet);
//     }

// });

// app.delete('/spreadsheet:ssid', (req, res) => {
//     console.log( `DELETE /spreadsheet/${req.params.ssid}`);
//     const ssid = req.params.ssid;
//     let spreadsheet = db.deleteSheetById(ssid);

// });

// app.delete('/user:userid', (req, res) => {
//     console.log( `DELETE /user/${req.params.userid}`);
// }   );
