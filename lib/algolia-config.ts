import { getCloudflareEnv } from "@/lib/cloudflare";
import { getEnv } from "@/lib/env";

export type AlgoliaConfig = {
  appId: string;
  searchOnlyApiKey: string;
  indexName: string;
};

export async function getPublicAlgoliaConfig(): Promise<AlgoliaConfig> {
  const env = await getCloudflareEnv();
  return {
    appId: env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? getEnv("NEXT_PUBLIC_ALGOLIA_APP_ID"),
    searchOnlyApiKey: env.NEXT_PUBLIC_ALGOLIA_SEARCH_ONLY_API_KEY ?? getEnv("NEXT_PUBLIC_ALGOLIA_SEARCH_ONLY_API_KEY"),
    indexName: env.NEXT_PUBLIC_ALGOLIA_INDEX ?? getEnv("NEXT_PUBLIC_ALGOLIA_INDEX"),
  };
}
