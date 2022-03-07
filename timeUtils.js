/**
 * Ensures that a numerical value falls within the range of 0-23. If it does not,
 * it is adjusted so this it is.
 * @example
 * // ensureValidTime(23) => 23
 * // ensureValidTime(24) => 0
 * // ensureValidTime(0) => 0
 * // ensureValidTime(1) => 1
 * // ensureValidTime(28) => 4
 * // ensureValidTime(-1) => 23
 * @param timeValue
 * @returns {number}
 */
const ensureValidTime = (timeValue) => timeValue % 24;

/**
 * Adjust a value by a given argument. If the value is an '*', does nothing.
 * @param val
 * @param adjustBy
 * @returns {string|number}
 */
const evaluateExpression = (val, adjustBy) => val === "*" ? "*" : ensureValidTime(Number(val) + adjustBy);

const shiftHour = (hourString, adjustBy) => {
  let v1;
  let v2;
  let joiner;

  // handles format  x/y
  if(hourString.includes("/")) {
    const pieces = hourString.split("/");
    joiner = "/";

    v1 = evaluateExpression(pieces[0], adjustBy);
    v2 = evaluateExpression(pieces[1], adjustBy);
  }
  // handles format  x-y
  else if(hourString.includes("-")) {
    const pieces = hourString.split("-");
    joiner = "-";

    v1 = evaluateExpression(pieces[0], adjustBy);
    v2 = evaluateExpression(pieces[1], adjustBy);

  } else {
    v1 = evaluateExpression(hourString, adjustBy);
  }

  // After adjusting the time values to be AWS CRON compliant
  return [null, undefined].includes(v2) ? `${v1}` : `${v1}${joiner}${v2}`;
}

/**
 * Handles the hour portion of an AWS cron expression
 * @param hoursString
 * @param adjustBy
 * @returns {string|*}
 */
export const processHourString = (hoursString, adjustBy) => {
  const shiftedHours = [];
  if (hoursString === "*") return hoursString;

  // handle a comma seperated list of values
  if (hoursString.includes(",")) {
    hoursString.split(",").forEach( hourToken => {

      shiftedHours.push(shiftHour(hourToken, adjustBy));
    })
  } else { // handle a single value
    shiftedHours.push(shiftHour(hoursString, adjustBy));
  }

  return shiftedHours.join(",");
}
