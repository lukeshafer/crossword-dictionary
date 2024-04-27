import { DB } from "@core/db";
import type { SQSEvent } from "aws-lambda";

export const handler = async (event: SQSEvent) => {
  // console.log("SQS Event received: ");
  // console.log(JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    let json;
    try {
      json = JSON.parse(record.body);
      if (!Array.isArray(json)) {
        throw new Error("Invalid body, must be an array", { cause: json });
      }
    } catch (e) {
      console.error("Error parsing the JSON");

      console.error(e);
    }

    const result = await DB.Words.addBulkWords(json);
    console.log(result);
  }
};
