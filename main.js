import {EventBridgeClient, ListRulesCommand, PutRuleCommand} from "@aws-sdk/client-eventbridge";
import parser from "aws-cron-parser";

// a client can be shared by different commands.
const client = new EventBridgeClient({ region: "us-east-1" });

// prepare AWS commands
const listRulesCommand = new ListRulesCommand({});

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
        const cronPieces = normalizedExp.split(" ");
        const minutes = cronPieces[0];
        const hours = cronPieces[1];
        const dayOfMonth = cronPieces[2];
        const dayOfWeek = cronPieces[3];
        const year = cronPieces[4];


        console.log({ full: rule.ScheduleExpression, cronPieces })

        //const updateCommand = new PutRuleCommand({ ...rule, ScheduleExpression: 'cron(0 2 ? * MON *)'});
        //const updateResponse = await client.send(updateCommand);
      }
    }
}

try {
  const response = await client.send(listRulesCommand);
  processRules(response.Rules);
} catch (err) {
  console.error(err);
}
