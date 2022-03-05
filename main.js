import {EventBridgeClient, ListRulesCommand, PutRuleCommand} from "@aws-sdk/client-eventbridge";
import parser from "aws-cron-parser";

// a client can be shared by different commands.
const client = new EventBridgeClient({ region: "us-east-1" });

// prepare AWS commands
const listRulesCommand = new ListRulesCommand({});


const ensureValidTime = (timeValue) => timeValue % 24;

const shiftHour = (hourString, adjustBy) => {
  let v1;
  let v2;
  let joiner;

  if(hourString.includes("/")) {
    const pieces = hourString.split("/");
    joiner = "/";

    v1 = pieces[0] === "*" ? "*" : ensureValidTime(Number(pieces[0]) + adjustBy);
    v2 = pieces[1] === "*" ? "*" : ensureValidTime(Number(pieces[1]) + adjustBy);
  } else if(hourString.includes("-")) {
    const pieces = hourString.split("-");
    joiner = "-";

    v1 = pieces[0] === "*" ? "*" : ensureValidTime(Number(pieces[0]) + adjustBy);
    v2 = pieces[1] === "*" ? "*" : ensureValidTime(Number(pieces[1]) + adjustBy);

  } else {
    v1 = hourString === "*" ? "*" : ensureValidTime(Number(hourString) + adjustBy);
  }

  return [null, undefined].includes(v2) ? `${v1}` : `${v1}${joiner}${v2}`;
}

const processHourString = (hoursString, adjustBy) => {
  const shiftedHours = [];
  if (hoursString === "*") return hoursString;

  if (hoursString.includes(",")) {
    hoursString.split(",").forEach( hourToken => {

      shiftedHours.push(shiftHour(hourToken, adjustBy));
    })
  } else {
    shiftedHours.push(shiftHour(hoursString, adjustBy));
  }

  return shiftedHours.join(",");
}

const processRules = async (rules) => {
  for (const rule of rules) {
      if (rule.ScheduleExpression) {
        // find out if the expression is of type 'cron' or 'rate'. We only want to process 'cron' expressions
        const [expressionType, exp] = rule.ScheduleExpression.split("(");
        if (expressionType !== "cron") continue; // if its not a cron, skip it

        // now that we've verified it a 'cron' expression, lets strip out the final paranthesis
        const normalizedExp = exp.split(")")[0];
        /*
          what each element means:
          Minutes,	Hours,	Day of month,	Month,	Day of week,	Year */
        const [minutes, hours, dayOfMonth, dayOfWeek, year] = normalizedExp.split(" ");

        const adjusted = processHourString(hours, 1);

        console.log({ full: rule.ScheduleExpression, adjusted })

        //const updateCommand = new PutRuleCommand({ ...rule, ScheduleExpression: 'cron(0 2 ? * MON *)'});
        //const updateResponse = await client.send(updateCommand);
      }
    }
}

try {
  const response = await client.send(listRulesCommand);
  await processRules(response.Rules);

  console.log("\nFinished.")
} catch (err) {
  console.error(err);
}
