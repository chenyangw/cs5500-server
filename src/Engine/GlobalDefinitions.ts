
export const ErrorMessages = {
  partial: "#ERR",
  divideByZero: "#DIV/0!",
  invalidCell: "#REF!",
  invalidFormula: "#ERR",
  invalidNumber: "#ERR",
  invalidOperator: "#ERR",
  missingParentheses: "#ERR",
  emptyFormula: "#EMPTY!", // this is not an error message but we use it to indicate that the cell is empty

}

const square = "x^2".replace('^2', '²');
const cube = "x^3".replace('^3', '³');
const squareRoot = '√';
const cubeRoot = '∛';
const arcsin = 'sin⁻¹';
const arccos = 'cos⁻¹';
const arctan = 'tan⁻¹';


export const ButtonNames = {
  edit_toggle: "edit-toggle",
  edit: "edit",
  done: "=",
  allClear: "AC",
  clear: "C",
  squareRoot: squareRoot,
  cubeRoot: cubeRoot,
  square: square,
  cube: cube,
  arcsin: arcsin,
  arccos: arccos,
  arctan: arctan,
}

//define the color used by different components
export const GlobalColors = {
  kidsPurple: "#788ef1",
  kidsred: "#f9667a",
  kidsyellow: "#feec65",
  kidsblue: "#66daff",
  kidsgreen: "#83f05f",
}

