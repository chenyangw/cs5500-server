import Cell from "./Cell"
import SheetMemory from "./SheetMemory"
import { ErrorMessages,  ButtonNames } from "./GlobalDefinitions";



export class FormulaEvaluator {
  // Define a function called update that takes a string parameter and returns a number
  private _errorOccured: boolean = false;
  private _errorMessage: string = "";
  private _currentFormula: FormulaType = [];
  private _lastResult: number = 0;
  private _sheetMemory: SheetMemory;
  private _result: number = 0;

  constructor(memory: SheetMemory) {
    this._sheetMemory = memory;
  }

  /**
   * evaluate the formula
   * @param formula
   * @returns The value of the expression in the tokenized formula
   * it also provides two properties formulaString and resultString
   * 
   * Uses a recursive descent parser to evaluate the formula
   * 
   * If the formula is empty return an empty string
   * If there is a formula and it is not valid return "error"
   * Otherwise return the value of the formula
   * 
   * The value of the formula is the value of the expression in the formula
   * 
   * The grammar for the formula is:
   * formula = expression
   * expression = term { ("+" | "-") term }
   * term = factor { ("*" | "/") factor }
   * factor = number | "(" expression ")" | cellReference
   * cellReference = a string of letters followed by a string of digits
   * 
   * The value of a number is the number
   * The value of a cellReference is the value of the cell
   * The value of an expression is the value of the first term plus or minus the value of the second term
   * The value of a term is the value of the first factor times or divided by the value of the second factor
   * The value of a factor is the value of the number or the value of the expression in the parentheses or the value of the cellReference
   * 
   * Recalc will be called individually for each cell in the spreadsheet.  
   * The assumption is that any cell is dependent on other cells their values are already calculated.
   * This means that recalc can simply read the value from the memory when it encounters a cellReference
   * 
   */

  evaluate(formula: FormulaType) {

    // make a copy of the formula
    //
    // set the currentFormula to the copy of the formula
    // we do this because the parser consumes the value in currentFormula 
    this._currentFormula = [...formula];

    this._lastResult = 0;

    // if the formula is empty return ""
    if (formula.length === 0) {
      this._errorMessage = ErrorMessages.emptyFormula;
      this._result = 0;
      return;
    }
    // set the errorOccured flag
    this._errorOccured = false;

    // clear the error message
    this._errorMessage = "";

    // get the value of the expression in the formula
    let resultValue = this.expression();
    this._result = resultValue;

    // if there are still tokens in the formula set the errorOccured flag
    // if an error has occured then we dont update the error message
    if (this._currentFormula.length > 0 && !this._errorOccured) {
      this._errorOccured = true;
      this._errorMessage = ErrorMessages.invalidFormula;
    }

    // if an error occured  and the message is PARTIAL return the last result
    if (this._errorOccured) {
      this._result = this._lastResult;
    }

  }

  public get error(): string {
    return this._errorMessage
  }

  public get result(): number {
    return this._result;
  }


  /**
   * 
   * @returns The value of the factor in the tokenized formula
   */
  private expression(): number {
    if(this._errorOccured){
      return this._lastResult;
    }
    let result = this.term();
    while (this._currentFormula.length > 0 && (this._currentFormula[0] === "+" || this._currentFormula[0] === "-")) {
      let operator = this._currentFormula.shift();
      let term = this.term();
      if (operator === "+") {
        result += term;

      } else {
        result -= term;
      }
    }
    // set the lastResult to the result
    this._lastResult = result;
    return result;
  }

  /**
   *  
   * @returns The value of the term in the tokenized formula
   *  
   */
  private term(): number {
    if (this._errorOccured) {
      return this._lastResult;
    }
    let result = this.factor();

    // if the next token is "+/-", modify the result to the opposite sign
    //if the next token is "1/x", and the result is not zero,modify the result to the inverse.
    // if the next token is "squareroot", and the result is not negative,modify the result to the square root.
    //if the next token is "cuberoot", modify the result to the cube root.
    //if the next token is "square", modify the result to the square.
    //if the next token is "cube", modify the result to the cube.
    //...
    const singleOperatorSet = ["+/-", "1/x", ButtonNames.squareRoot, ButtonNames.cubeRoot, ButtonNames.square, ButtonNames.cube, 
    "sin", "cos", "tan", ButtonNames.arcsin, ButtonNames.arccos, ButtonNames.arctan]

    while(this._currentFormula.length > 0 && singleOperatorSet.includes(this._currentFormula[0]))
    {
      let operator_single = this._currentFormula.shift();
      switch(operator_single){
        case "+/-":
          result = -result;
          break;

        case "1/x":
          if (result !== 0){  
            result = 1/result;
          } else {
            this._errorOccured = true;
            this._errorMessage = ErrorMessages.divideByZero;
            this._lastResult = Infinity;
            return Infinity;
          }
          break;

        case ButtonNames.squareRoot:
          if (result >= 0){
            result = Math.sqrt(result);
          }
          break;

        case ButtonNames.cubeRoot:
          result = Math.cbrt(result);
          break;

        case ButtonNames.square:
          result = Math.pow(result, 2);
          break;

        case ButtonNames.cube:
          result = Math.pow(result, 3);
          break;

        case "sin":
          result = Math.sin(result);
          break;

        case "cos":
          result = Math.cos(result);
          break;

        case "tan":
          result = Math.tan(result);
          break;

        case ButtonNames.arcsin:
          result = Math.asin(result); 
          break;

        case ButtonNames.arccos:
          result = Math.acos(result);
          break;

        case ButtonNames.arctan:
          result = Math.atan(result);
          break;
          
        default:
          this._errorOccured = true;
      }
    }

    while (this._currentFormula.length > 0 && (this._currentFormula[0] === "*" || this._currentFormula[0] === "/")) {
      let operator = this._currentFormula.shift();
      let factor = this.factor();
      if (operator === "*") {
        result *= factor;
      } else {
        // check for divide by zero
        if (factor === 0) {
          this._errorOccured = true;
          this._errorMessage = ErrorMessages.divideByZero;
          this._lastResult = Infinity;
          return Infinity;
        }
        // we are ok, lets divide
        result /= factor;
      }
    }
    // set the lastResult to the result
    this._lastResult = result;
    return result;
  }

  /**
   *  
   * @returns The value of the factor in the tokenized formula
   * 
   */
  private factor(): number {
    if (this._errorOccured) {
      return this._lastResult;
    }
    // if (this._errorOccured) {
    //   return 0;
    // }
    let result = 0;
    // if the formula is empty set errorOccured to true 
    // and set the errorMessage to "PARTIAL"
    // and return 0
    if (this._currentFormula.length === 0) {
      this._errorOccured = true;
      this._errorMessage = ErrorMessages.partial;
      return result;
    }

    // get the first token in the formula
    let token = this._currentFormula.shift();

    // if the token is a number set the result to the number
    // and set the lastResult to the number
    if (this.isNumber(token)) {
      result = Number(token);
      this._lastResult = result;

      // if the token is a "(" get the value of the expression
    } else if (token === "(") {
      result = this.expression();
      if (this._currentFormula.length === 0 || this._currentFormula.shift() !== ")") {
        this._errorOccured = true;
        this._errorMessage = ErrorMessages.missingParentheses;
        this._lastResult = result
      }

      // if the token is a cell reference get the value of the cell
    } else if (this.isCellReference(token)) {
      [result, this._errorMessage] = this.getCellValue(token);

      // if the cell value is a number set the result to the number
      if (this._errorMessage !== "") {
        this._errorOccured = true;
        this._lastResult = result;
      }

      // if the tokem is "Rand", set the result to a random number
    } else if(token === "Rand"){
      // result = Math.random();
      let cellSeed = this.generateSeed();
      result = this.seededRandom(cellSeed);
      this._lastResult = result;
      // otherwise set the errorOccured flag to true  
    } 
    else {
      this._errorOccured = true;
      this._errorMessage = ErrorMessages.invalidFormula;
    }
    return result;
  }

  /**
   * generate a unique seed for each cell using the current cell row and column
   * @param row
   * @param column
   * @returns a unique seed for each cell
   */
  private generateSeed(): number {
    let cell = this._sheetMemory.getCurrentCell();
    let label = cell.getLabel();

    let row = Cell.cellToColumnRow(label)[0];
    let column = Cell.cellToColumnRow(label)[1];
    return (row + 2) * 1000 + column;
  }

  /**
   * a function to generate a seeded random number
   * @param seed
   * @returns a random number between 0 and 1
   */
  private seededRandom(seed: number): number {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  /**
   * 
   * @param token 
   * @returns true if the toke can be parsed to a number
   */
  isNumber(token: TokenType): boolean {
    return !isNaN(Number(token));
  }

  /**
   * 
   * @param token
   * @returns true if the token is a cell reference
   * 
   */
  isCellReference(token: TokenType): boolean {

    return Cell.isValidCellLabel(token);
  }

  /**
   * 
   * @param token
   * @returns [value, ""] if the cell formula is not empty and has no error
   * @returns [0, error] if the cell has an error
   * @returns [0, ErrorMessages.invalidCell] if the cell formula is empty
   * 
   */
  getCellValue(token: TokenType): [number, string] {

    let cell = this._sheetMemory.getCellByLabel(token);
    let formula = cell.getFormula();
    let error = cell.getError();

    // if the cell has an error return 0
    if (error !== "" && error !== ErrorMessages.emptyFormula) {
      return [0, error];
    }

    // if the cell formula is empty return 0
    if (formula.length === 0) {
      return [0, ErrorMessages.invalidCell];
    }


    let value = cell.getValue();
    return [value, ""];

  }


}

export default FormulaEvaluator;