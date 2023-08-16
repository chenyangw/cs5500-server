import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Home from './Components/Home';
import { Route, BrowserRouter, Routes} from 'react-router-dom';
import NewUser from './Components/NewUser';
import SpreadSheet from './Components/SpreadSheet';

function Root(){

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path={"/app"} element={<App />} />
        {/* /</Routes><Route path={/app/userName?{userName}`} element={<App />} /> */}
          <Route path="*" element={<h1>Not Found</h1>} />
          <Route path="/newuser" element={<NewUser />} />
          <Route path="/spreadsheet/:ssId" element={<SpreadSheet />} />
      </Routes>
    </BrowserRouter>
  )
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(<Root />);  

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
