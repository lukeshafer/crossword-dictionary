import "sst"
declare module "sst" {
  export interface Resource {
    DictionaryLookupDb: {
      name: string
      type: "sst.aws.Dynamo"
    }
    WordUploadBucket: {
      name: string
      type: "sst.aws.Bucket"
    }
    NewWordQueue: {
      type: "sst.aws.Queue"
      url: string
    }
  }
}
export {}