import { DB } from "../db.mjs";

export const handler = async () => {
  console.log("Getting word 'apple'");
  try {
    const word = await DB.Words.get("apple");

    return word;
  } catch (e) {
    return e;
  }
};
