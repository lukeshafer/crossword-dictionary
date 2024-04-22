import { DB } from "@core/db";
import type { APIGatewayProxyEventV2 } from "aws-lambda";

export const handler = async (event: APIGatewayProxyEventV2) => {
  const { word } = event.pathParameters ?? {};
  if (!word) return "no word";
  console.log("Getting word 'apple'");
  return DB.Words.get(word).catch((e) => e);
};
