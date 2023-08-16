import React from "react";

import "./Formula.css";



// FormulaComponentProps
// we pass in value for the formula 
// and the value for the current result
type FormulaProps = {
  formulaString: string;
  resultString: string;
} // interface FormulaProps




const Formula: React.FC<FormulaProps> = ({ formulaString, resultString }) => {
  return (
    <div className="formulaAndResultContainer">
      <div className="formulaContainer">
        <span data-testid="FormulaTitle">Formula : </span>
        <div className="formula">
          <span data-testid="FormulaValue">{formulaString} </span>
        </div>
      </div>
      <div className="resultContainer">
        <span data-testid="Result">Result : </span>
        <div className="formula">
          <span data-testid="FormulaResult">{resultString}</span>
        </div>
      </div>
    </div>

  );
} // const Formula 

export default Formula; 