import {
  S3Client,
  BucketAlreadyExists,
  CreateBucketCommand,
  BucketAlreadyOwnedByYou,
  ListObjectsV2Command,
  NoSuchBucket,
  AccessDenied,
  GetObjectCommand,
  PutObjectCommand,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { loadCredentials, type Credentials } from "include/src/credentials";
import {
  type ResponseType,
  MEMORIES_SENTINEL,
  type MemoryToolResult,
  type Memory,
} from "store/src/types";

export class MemoriesSingleton {
  static instance: MemoriesSingleton | null = null;

  // assigned in the constructor, but TS's control-flow analysis can't see
  // through the early-return-if-already-instantiated singleton pattern
  client!: S3Client;
  bucket!: string;
  region!: string;

  constructor() {
    if (MemoriesSingleton.instance != null) {
      return MemoriesSingleton.instance;
    }

    const credentials = loadCredentials();
    this.bucket = credentials.s3.bucket;
    this.region = credentials.s3.region;
    this.client = new S3Client({ region: this.region });
    MemoriesSingleton.instance = this;
  }

  init(credentials: Credentials) {
    this.bucket = credentials.s3.bucket;
    this.upsert_bucket(this.bucket);
  }

  // TODO later: once # objects exceeds 1000, results
  // are paginated and need to be consumed properly
  async list_memories(): Promise<Array<string>> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: MEMORIES_SENTINEL,
      });
      const response = await this.client.send(command);
      return (
        response.Contents?.flatMap((obj) => (obj.Key ? [obj.Key] : [])) ?? []
      );
    } catch (error: unknown) {
      if (error instanceof NoSuchBucket) {
        console.error(`No such bucket: ${this.bucket}`);
      } else if (error instanceof AccessDenied) {
        console.error(`Permissions on ${this.bucket} not setup properly`);
      } else {
        throw error;
      }
    }
    return [];
  }

  async upsert_bucket(bucket: string): Promise<void> {
    try {
      await this.client.send(
        new CreateBucketCommand({
          Bucket: bucket,
        }),
      );
    } catch (error: unknown) {
      if (error instanceof BucketAlreadyExists) {
        // upsert - do nothing
      }

      // from the aws s3 client documentation:
      // WARNING: If you try to create a bucket in the North Virginia region,
      // and you already own a bucket in that region with the same name, this
      // error will not be thrown. Instead, the call will return successfully
      // and the ACL on that bucket will be reset.
      else if (error instanceof BucketAlreadyOwnedByYou) {
        console.error(
          `The bucket "${bucket}" already exists in this AWS account.`,
        );
      } else {
        throw error;
      }
    }
  }

  async fetch_memories(
    project: string,
  ): Promise<ResponseType<MemoryToolResult>> {
    try {
      const { Contents = [] } = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: project
            ? `${MEMORIES_SENTINEL}/${project}`
            : MEMORIES_SENTINEL,
        }),
      );

      const memories: Memory[] = await Promise.all(
        Contents.flatMap(({ Key }) => (Key ? [Key] : [])).map(async (Key) => {
          const res = await this.client.send(
            new GetObjectCommand({ Bucket: this.bucket, Key }),
          );
          const memoryProject = Key.slice(MEMORIES_SENTINEL.length + 1);
          const content = (await res.Body?.transformToString()) ?? "";
          return { project: memoryProject, content };
        }),
      );

      return {
        status: "ok",
        data: { memories },
      };
    } catch (error: unknown) {
      let errmsg: string;
      if (error instanceof S3ServiceException) {
        errmsg = error.name;
      } else {
        throw error;
      }
      return {
        status: "error",
        errmsg,
      };
    }
  }

  async upload_memory(prefix: string, content: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: `${MEMORIES_SENTINEL}/${prefix}`,
        Body: content,
      }),
    );
  }
}
