import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  PutCommand,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";

const baseClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(baseClient);

const TABLE_NAME = Resource.DictionaryLookupDb.name;

type Word = {
  word: string;
  length: number;
  start: string;
};

export const DB = {
  Words: {
    async get(word: string): Promise<Word> {
      const { Item } = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { word: word.toUpperCase() },
        }),
      );

      if (!Item) {
        return Promise.reject("Word not found.");
      }

      console.log("Got item from dynamo db", { Item });

      return Item as Word;
    },
    /**
     * Searches for a word based on the position
     */
    async searchPosition(args: {
      length: number;
      position: number;
      search: string;
    }): Promise<string[]> {
      const positionStr = args.position === 1 ? "" : args.position;
      const search = args.search.toUpperCase();
      const IndexName = `Position${args.position}`;
      const hashKeyName = `lengthStart${positionStr}`;
      const rangeKeyName = `word${positionStr}`;

      const command = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName,
        ExpressionAttributeValues: {
          ":pk": `${args.length}${search[0]}`,
          ":sk": search,
        },
        ExpressionAttributeNames: {
          "#pk": hashKeyName,
          "#sk": rangeKeyName,
        },
        KeyConditionExpression: `#pk = :pk AND begins_with(#sk, :sk)`,
      });

      // console.log("Query Command", JSON.stringify(command.input, null, 2));

      const result = await docClient.send(command);

      return result.Items?.map((item) => item.word) ?? [];
    },
    /**
     * Adds a word to the database.
     */
    async addWord(word: string) {
      const entry = prepareWordEntry(word);

      const result = await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: entry,
        }),
      );

      return result;
    },

    async addBulkWords(words: ReadonlyArray<string>) {
      const entries = words.map(prepareWordEntry);

      // do batch write commands, 25 entries at a time

      const BATCH_SIZE = 25;

      let processed = 0;
      let unprocessed = 0;

      for (let i = 0; i < entries.length; i += BATCH_SIZE) {
        // console.log(i);
        const batch = entries.slice(i, i + BATCH_SIZE);
        const command = new BatchWriteCommand({
          RequestItems: {
            [TABLE_NAME]: batch.map((Item) => ({ PutRequest: { Item } })),
          },
        });

        const result = await docClient.send(command);
        const unprocessedList = Object.keys(result.UnprocessedItems ?? {});

        if (result.UnprocessedItems) {
          console.log(
            "UnprocessedItems: ",
            unprocessedList.length,
            result.UnprocessedItems,
          );
        }

        processed += batch.length - unprocessedList.length;
        unprocessed += unprocessedList.length;
      }

      return {
        processed,
        unprocessed,
      };
    },
  },
};

function prepareWordEntry(word: string): Record<string, any> {
  word = word.toUpperCase();

  const properties = new Map();
  properties.set("word", word);
  properties.set("length", word.length);
  properties.set("start", word.at(0));
  properties.set(
    "lengthStart",
    `${properties.get("length")}${properties.get("start")}`,
  );

  for (let index = 1; index < word.length; index++) {
    const pos = index + 1;
    const offsetWord = word.slice(index, word.length) + word.slice(0, index);
    const offsetStart = offsetWord[0];

    properties.set(`lengthStart${pos}`, `${word.length}${offsetStart}`);
    properties.set(`word${pos}`, `${offsetWord}`);
  }

  return Object.fromEntries(properties.entries());
}
