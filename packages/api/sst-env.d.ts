import "sst"
declare module "sst" {
  export interface Resource {
    WordUploadBucket: {
      name: string
      type: "sst.aws.Bucket"
    }
    NewWordQueue: {
      type: "sst.aws.Queue"
      url: string
    }
    DictionaryLookupDb: {
      type: "sst.aws.Dynamo"
      name: string
    }
  }
}
export {}