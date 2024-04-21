import { DB } from "../db.mjs";

/** @type {import('aws-lambda').APIGatewayProxyHandlerV2} */
export const handler = async (event) => {
  const { word } = event.pathParameters ?? {};

  if (!word)
    return {
      statusCode: 404,
      body: "you didn't give  a word!",
    };

  return JSON.stringify(await DB.Words.addWord(word), null, 2);
};
