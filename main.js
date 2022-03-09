import {EventBridgeClient, ListRulesCommand, PutRuleCommand} from "@aws-sdk/client-eventbridge";
import {processHourString} from "./timeUtils.js";
import * as assert from "assert";

// a client can be shared by different commands.
const client = new EventBridgeClient({ region: "us-east-1" });

// prepare AWS commands
const listRulesCommand = new ListRulesCommand({});

// iterate through rules
const adjustRuleCronHours = async (rules, adjustTimeBy, dryRun = true) => {
  if(typeof adjustTimeBy !== "number") throw new Error("adjustTimeBy must a number");

  for (const rule of rules) {
      if (rule.ScheduleExpression && rule.Name !== "daylight-saving-cron-adjuster") {
        // find out if the expression is of type 'cron' or 'rate'. We only want to process 'cron' expressions
        const [expressionType, exp] = rule.ScheduleExpression.split("(");
        if (expressionType !== "cron") continue; // if its not a cron, skip it

        // now that we've verified it a 'cron' expression, lets strip out the final paranthesis
        const normalizedExp = exp.split(")")[0];
        /*
          what each element means:
          Minutes,	Hours,	Day of month,	Month,	Day of week,	Year */
        const [minutes, hours, dayOfMonth, month, dayOfWeek, year] = normalizedExp.split(" ");

        const adjustedHour = processHourString(hours, adjustTimeBy);
        const adjustedCron = `cron(${minutes} ${adjustedHour} ${dayOfMonth} ${month} ${dayOfWeek} ${year})`

        if (dryRun){
          console.log({ name: rule.Name, currentRule: rule.ScheduleExpression, adjustedCron })
        } else {
          const updateCommand = new PutRuleCommand({ ...rule, ScheduleExpression: adjustedCron});
          const updateResponse = await client.send(updateCommand);
          console.log("Successfully Adjusted", updateResponse);
        }
      }
    }
}

const fetchAllRules = async () => {
  const rules = [];
  let NextToken;
  let response;

  do {
    response = await client.send(new ListRulesCommand({ NextToken }));
    rules.push(...response.Rules);

    NextToken = response.NextToken;
  } while(!!response.NextToken)

  return rules;
}

// Do the thing
try {
  const rules = await fetchAllRules();
  await adjustRuleCronHours(rules, 1);

  console.log("\nFinished.")
} catch (err) {
  console.error(err);
}
