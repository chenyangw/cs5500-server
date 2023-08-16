# CS5500 Final Project: Collaborative Spreadsheet Calculator

This is the final project for the CS5500 course at Northeastern University. The project is a spreadsheet calculator that allows users to collaborate on creating and editing spreadsheets.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Introduction

This project serves as the culmination of our work in the CS5500 course at Northeastern University. Our aim is to develop a collaborative spreadsheet calculator tailored to the needs of young students who are learning about mathematics and computing. This calculator offers a simplified interface that introduces the concept of spreadsheets without the complexity of tools like Excel.

## User Stories

Our client, who wishes to introduce spreadsheet concepts to young learners, has outlined the following user stories to guide our development:

1. Collaborative Editing: Implement real-time collaborative editing of a sheet using a central authoritative server.
2. Document Storage: Enable the loading and saving of documents on a backend datastore, allowing teachers to manage and access simple spreadsheets.
3. Enhanced Functionality: Expand the calculator's capabilities by adding additional calculator functions, updating the user interface, and refining the existing functions.

## Design Overview

### Classroom Integration

Given that our target users are children, we've designed the entry page to request a class session ID. Students can use this ID, provided by their teacher, to access a shared list of spreadsheets.

- Teachers can initiate a new class session using the 'New Session' option.
- Upon entering a class session ID, users are directed to the dashboard, which displays available spreadsheets for the class.
- Teachers can create new spreadsheets with custom row and column configurations.
- Pre-created spreadsheets can be saved for specific classes, streamlining the teaching process.
- All spreadsheets associated with the current session are listed for easy access.
- User information is displayed on the right-hand side, with an option to log out if needed.

### Spreadsheet Interface

To enhance usability and cater to our young audience, we've made several design decisions:

- Scientific functions have been integrated as per requirements.
- The navbar provides pertinent information about the current spreadsheet:
  - Top left: Class session ID and spreadsheet ID.
  - Center: The current connected user is assigned a random cute avatar in pixels.
  - Top right: Quick escape buttons for going back or logging out.
- User-friendly design elements, such as rounded buttons and a light color scheme, create a child-friendly UI.

## Getting Started

In the project directory, you can use the following scripts:

### `npm start`

Launches the app in development mode. Visit [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm run server`

Starts the Express server on port `3005`.

### `npm run dev`

Concurrently runs the React frontend and Express server.

### `npm test`

Initiates the test runner in interactive watch mode.

### `npm run build`

Builds the app for production, generating the `build` folder.

## Future Enhancements

To further enhance our project, we have identified several potential improvements:

- Improve real-time data updates using sockets to benefit all users.
- Refine the UI design based on continued research into the preferences and needs of our young users.
- Connect to a cloud database for improved accessibility, data storage, and recovery options.
- Deploy the project to a live server to provide a seamless experience beyond the classroom environment, not limited in classroom.

We are excited about the current state of our project and look forward to its continued evolution to better serve young learners and educators alike.

_Thank you for your interest in our Collaborative Spreadsheet Calculator!_
