import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { SQSClient, SendMessageBatchCommand } from "@aws-sdk/client-sqs";
import type { S3CreateEvent } from "aws-lambda";
import { Resource } from "sst";

const BATCH_SIZE = 25;
const s3 = new S3Client({});
const sqs = new SQSClient({});

export const handler = async (e: S3CreateEvent) => {
  // console.log("HELLO S3");
  const [record] = e.Records;
  console.log("Received S3 create event, adding words to database");
  const item = await s3.send(
    new GetObjectCommand({
      Key: record.s3.object.key,
      Bucket: record.s3.bucket.name,
    }),
  );

  const body = await item.Body?.transformToString();
  const words = (body?.split("\n") ?? []).map((w) => w.trim().toUpperCase());

  const sqsBatchPromises: Array<Promise<any>> = [];
  let ddbBatches: Array<string> = [];
  let sqsBatchCount = 0;
  let ddbBatchCount = 0;

  for (let i = 0; i < words.length; i += BATCH_SIZE) {
    const ddbBatch = words.slice(i, i + BATCH_SIZE);
    ddbBatchCount += 1;

    ddbBatches.push(JSON.stringify(ddbBatch));

    if (ddbBatches.length === 10) {
      console.log("Processing batch", sqsBatchCount + 1);

      const sqsBatch = ddbBatches.slice();
      const batchNumber = ++sqsBatchCount;

      const cmd = new SendMessageBatchCommand({
        QueueUrl: Resource.NewWordQueue.url,
        Entries: sqsBatch.map((batch, index) => ({
          Id: `batch_${batchNumber}_${index}`,
          MessageBody: batch,
        })),
      });

      const sendPromise = sqs.send(cmd);
      sqsBatchPromises.push(sendPromise);

      ddbBatches = [];
    }
  }

  await Promise.all(sqsBatchPromises);

  console.log("SQS Batches sent:", sqsBatchCount);
  console.log("Total DDB Batches sent:", ddbBatchCount);
};
