import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DB } from "@core/db";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const { word } = event.pathParameters ?? {};

  if (!word)
    return {
      statusCode: 404,
      body: "you didn't give a word!",
    };

  const result = JSON.stringify(await DB.Words.addWord(word), null, 2);
  console.log({ result });
  return result;
};
