import { Resource } from "sst";
import awsLite from "@aws-lite/client";
import dynamoDb from "@aws-lite/dynamodb";

const TABLE_NAME = Resource.DictionaryLookupDb.name;

const aws = await awsLite({ plugins: [dynamoDb] });

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

      return Item;
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
      /** @type {Record<string, any>} */
      const properties = {
        word,
        length: word.length,
        start: word[0],
      };

      console.log("Word at position", 1, word);

      for (let index = 1; i < word.length; i++) {
        const position = index + 1;

        const offsetWord =
          word.slice(index, word.length - 1) + word.slice(0, index);

        console.log("Word at position", position, offsetWord);
      }
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
