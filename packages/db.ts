import { Resource } from "sst";
import awsLite from "@aws-lite/client";
// @ts-expect-error - No type definitions for this lib
import ddb from "@aws-lite/dynamodb";

const TABLE_NAME = Resource.DictionaryLookupDb.name;

const aws = await awsLite({ plugins: [ddb] });

export const DB = {
  Words: {
    /**
     * @param {string} word
     * @returns {Promise<Word>}
     **/
    async get(word) {
      const { Item } = await aws.DynamoDB.GetItem({
        TableName: TABLE_NAME,
        Key: { word: word.toUpperCase() },
      });

      if (!Item) {
        return Promise.reject("Word not found.");
      }

      return {
        word: Item.word,
        length: Item.length,
        start: Item.start,
      };
    },
    /**
     * @param {object} args
     * @param {1 | 2 | 3 | 4 | 5 | 6 | 7} args.length
     * @param {1 | 2 | 3 | 4 | 5 | 6 | 7} args.position - Position of character, with starting index of 1
     * @param {string} args.search
     */
    async searchPosition(args) {
      const IndexName = `Position${args.position}`;
      const hashKeyName = `lengthStart${args.position}`;

      const result = await aws.DynamoDB.Query({
        TableName: TABLE_NAME,
        IndexName,
        KeyConditionExpression: "$pk = :pk AND begins_with(word, :sk)",
        ExpressionAttributeValues: {
          ":pk": {
            S: `${args.length}${args.search[0]}`,
          },
          ":sk": {
            S: args.search,
          },
        },
        ExpressionAttributeNames: {
          $pk: hashKeyName,
        },
      });

      return result.Items ?? [];
    },
    /**
     * Adds a word to the database.
     *
     * @param {string} word
     */
    async addWord(word) {
      const properties = new Map();
      properties.set("word", word);
      properties.set("length", word.length);
      properties.set("start", word.at(0));

      console.log("Word at position", 1, word);

      for (let index = 1; index < word.length; index++) {
        const pos = index + 1;

        const offsetWord =
          word.slice(index, word.length) + word.slice(0, index);

        const offsetStart = offsetWord[0];

        console.log("Word at position", pos, offsetWord);

        properties.set(`lengthStart${pos}`, `${word.length}${offsetStart}`);
        properties.set(`word${pos}`, `${offsetWord}`);
      }

      return Object.fromEntries(properties.entries());
    },
  },
};

/**
 * @typedef Word
 * @prop {string} word
 * @prop {number} length
 * @prop {string} start
 */

/**
 * @typedef Position
 * @type {1 | 2 | 3 | 4 | 5 | 6 | 7}
 */
