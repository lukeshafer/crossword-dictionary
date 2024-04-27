/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "crossword-dictionary",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: "us-east-2",
        },
      },
    };
  },
  async run() {
    const db = new sst.aws.Dynamo("DictionaryLookupDb", dynamoArgs);

    const api = new sst.aws.ApiGatewayV2("Api");
    api.route("GET /word/{word}", {
      handler: "packages/api/getWord.handler",
      link: [db],
    });
    api.route("GET /create/{word}", {
      handler: "packages/api/createWord.handler",
      link: [db],
    });
    api.route("GET /search", {
      handler: "packages/api/searchWord.handler",
      link: [db],
    });

    new sst.aws.StaticSite("Site", {
      path: "packages/frontend",
      build: {
        command: "pnpm run build",
        output: "dist",
      },
      environment: {
        VITE_API_URL: api.url,
      },
    });

    const newWordQueue = new sst.aws.Queue("NewWordQueue", {
      transform: {
        queue: {
          delaySeconds: 1,
        },
      },
    });
    newWordQueue.subscribe(
      {
        handler: "packages/api/sqs/batchCreateWords.handler",
        link: [db],
      },
      {
        transform: {
          eventSourceMapping(args) {
            args.batchSize = 1;
            args.maximumBatchingWindowInSeconds = 1;
          },
        },
      },
    );

    const uploadBucket = new sst.aws.Bucket("WordUploadBucket");
    uploadBucket.subscribe({
      link: [uploadBucket, newWordQueue],
      handler: "packages/api/s3/handleWordListUpload.handler",
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
const dynamoArgs: sst.aws.DynamoArgs = {
  fields: {
    word: "string",
    lengthStart: "string",
    word2: "string",
    lengthStart2: "string",
    word3: "string",
    lengthStart3: "string",
    word4: "string",
    lengthStart4: "string",
    word5: "string",
    lengthStart5: "string",
    word6: "string",
    lengthStart6: "string",
    word7: "string",
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
      rangeKey: "word2",
    },
    Position3: {
      hashKey: "lengthStart3",
      rangeKey: "word3",
    },
    Position4: {
      hashKey: "lengthStart4",
      rangeKey: "word4",
    },
    Position5: {
      hashKey: "lengthStart5",
      rangeKey: "word5",
    },
    Position6: {
      hashKey: "lengthStart6",
      rangeKey: "word6",
    },
    Position7: {
      hashKey: "lengthStart7",
      rangeKey: "word7",
    },
  },
};
