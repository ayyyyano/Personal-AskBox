import { liteClient as algoliasearch } from "algoliasearch/lite";

export type SearchResult = {
  id: string;
  nickname: string | null;
  content: string;
  answer: string | null;
  status: string;
  attachment_key: string | null;
  created_at: string;
  published_at: string | null;
};

const APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? "";
const SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_ONLY_API_KEY ?? "";
const INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? "";

let client: ReturnType<typeof algoliasearch> | null = null;
function getClient() {
  if (!APP_ID || !SEARCH_KEY) return null;
  if (!client) client = algoliasearch(APP_ID, SEARCH_KEY);
  return client;
}

export async function searchQuestions(query: string, filters?: string) {
  const c = getClient();
  if (!c || !INDEX_NAME) return { hits: [] as SearchResult[] };

  const results = await c.search<SearchResult>({
    requests: [{ indexName: INDEX_NAME, query, filters, hitsPerPage: 20 }],
  });
  const firstResult = results.results[0] as { hits?: SearchResult[] } | undefined;
  return { hits: firstResult?.hits ?? [] };
}
