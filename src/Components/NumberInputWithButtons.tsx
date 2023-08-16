import React, { useState } from 'react';
import './NumberInputWithButtons.css'; // Import the CSS file
import './GlobalStyle.css';

function NumberInputWithButtons({getInput} : {getInput: (value: number) => void}) {
  const [number, setNumber] = useState(1);

  const handleIncrement = () => {
    setNumber(number + 1);
    getInput(number + 1);
  };

  const handleDecrement = () => {
    if (number > 1) {
      setNumber(number - 1);
      getInput(number - 1);
    }
  };

  return (
    <div className="number-input-container">
      <button className="button" onClick={handleDecrement}>-</button>
      <input
        className="number-input"
        type="number"
        value={number}
        readOnly 
      />
      <button className="button" onClick={handleIncrement}>+</button>
    </div>
  );
}

export default NumberInputWithButtons;
