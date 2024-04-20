import { DB } from "../db.mjs";

/** @type {import('aws-lambda').APIGatewayProxyHandlerV2} */
export const handler = async (event) => {
  const { word } = event.pathParameters;

  await DB.Words.addWord(word);
  return "added " + word;
};
