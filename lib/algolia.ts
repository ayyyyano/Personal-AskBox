import { liteClient as algoliasearch } from "algoliasearch/lite";
import type { AlgoliaConfig } from "@/lib/algolia-config";

export type SearchResult = {
  id?: string;
  objectID?: string;
  nickname: string | null;
  content: string;
  answer: string | null;
  status: string;
  attachment_key: string | null;
  created_at: string;
  answered_at?: string | null;
  published_at: string | null;
};

let client: { key: string; value: ReturnType<typeof algoliasearch> } | null = null;
function getClient(config: AlgoliaConfig) {
  const key = `${config.appId}:${config.searchOnlyApiKey}`;
  if (!config.appId || !config.searchOnlyApiKey) return null;
  if (!client || client.key !== key) client = { key, value: algoliasearch(config.appId, config.searchOnlyApiKey) };
  return client.value;
}

export async function searchQuestions(query: string, filters?: string, config?: AlgoliaConfig) {
  const resolved = config ?? {
    appId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? "",
    searchOnlyApiKey: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_ONLY_API_KEY ?? "",
    indexName: process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? "",
  };
  const c = getClient(resolved);
  if (!c || !resolved.indexName) return { hits: [] as SearchResult[] };

  const results = await c.search<SearchResult>({
    requests: [{ indexName: resolved.indexName, query, filters, hitsPerPage: 20 }],
  });
  const firstResult = results.results[0] as { hits?: SearchResult[] } | undefined;
  return { hits: firstResult?.hits ?? [] };
}
