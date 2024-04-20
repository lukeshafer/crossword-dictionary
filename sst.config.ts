/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "crossword-dictionary",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const db = new sst.aws.Dynamo("DictionaryLookupDb", dynamoArgs);

    const api = new sst.aws.ApiGatewayV2("Api");
    api.route("GET /word", { handler: "src/api/getWord.handler", link: [db] });
    api.route("GET /word/{word}", {
      handler: "src/api/createWord.handler",
      link: [db],
    });

    return {
      api: api.url,
    };
  },
});

//
// LONGER CONFIG / ARGUMENTS
//

/** DynamoDB Configuration */
const dynamoArgs = {
  fields: {
    word: "string",
    lengthStart: "string",
    lengthStart2: "string",
    lengthStart3: "string",
    lengthStart4: "string",
    lengthStart5: "string",
    lengthStart6: "string",
    lengthStart7: "string",
    // Starting with 7 letter words for now. Will add more if this strategy works
  },
  primaryIndex: {
    hashKey: "word",
  },
  globalIndexes: {
    Position1: {
      hashKey: "lengthStart",
      rangeKey: "word",
    },
    Position2: {
      hashKey: "lengthStart2",
      rangeKey: "word",
    },
    Position3: {
      hashKey: "lengthStart3",
      rangeKey: "word",
    },
    Position4: {
      hashKey: "lengthStart4",
      rangeKey: "word",
    },
    Position5: {
      hashKey: "lengthStart5",
      rangeKey: "word",
    },
    Position6: {
      hashKey: "lengthStart6",
      rangeKey: "word",
    },
    Position7: {
      hashKey: "lengthStart7",
      rangeKey: "word",
    },
  },
} as const;

export type GlobalIndexName = keyof (typeof dynamoArgs)["globalIndexes"];
export type GlobalIndexHashKey<Index extends GlobalIndexName> =
  (typeof dynamoArgs)["globalIndexes"][Index]["hashKey"];
