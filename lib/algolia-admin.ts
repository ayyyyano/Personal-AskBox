import { getEnv } from "./env";
import { getCloudflareEnv } from "./cloudflare";

async function client() {
  const { algoliasearch } = await import("algoliasearch");
  const env = await getCloudflareEnv();
  const appId = env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? getEnv("NEXT_PUBLIC_ALGOLIA_APP_ID");
  const adminKey = env.ALGOLIA_ADMIN_API_KEY ?? getEnv("ALGOLIA_ADMIN_API_KEY");
  if (!appId || !adminKey) return null;
  return algoliasearch(appId, adminKey);
}

export type AlgoliaQuestion = {
  objectID: string;
  nickname: string | null;
  content: string;
  answer: string | null;
  status: string;
  attachment_key: string | null;
  created_at: string;
  answered_at: string | null;
  published_at: string | null;
};

export async function indexQuestion(record: AlgoliaQuestion) {
  const c = await client();
  const env = await getCloudflareEnv();
  const indexName = env.NEXT_PUBLIC_ALGOLIA_INDEX ?? getEnv("NEXT_PUBLIC_ALGOLIA_INDEX");
  if (!c || !indexName) return;
  await c.saveObject({ indexName, body: record }).catch((error) => console.error("Algolia index failed", error));
}

export async function partialUpdateQuestion(objectID: string, fields: Partial<AlgoliaQuestion>) {
  const c = await client();
  const env = await getCloudflareEnv();
  const indexName = env.NEXT_PUBLIC_ALGOLIA_INDEX ?? getEnv("NEXT_PUBLIC_ALGOLIA_INDEX");
  if (!c || !indexName) return;
  await c.partialUpdateObject({ indexName, objectID, attributesToUpdate: fields }).catch((error) => console.error("Algolia update failed", error));
}

export async function deleteQuestionFromIndex(objectID: string) {
  const c = await client();
  const env = await getCloudflareEnv();
  const indexName = env.NEXT_PUBLIC_ALGOLIA_INDEX ?? getEnv("NEXT_PUBLIC_ALGOLIA_INDEX");
  if (!c || !indexName) return;
  await c.deleteObject({ indexName, objectID }).catch((error) => console.error("Algolia delete failed", error));
}
