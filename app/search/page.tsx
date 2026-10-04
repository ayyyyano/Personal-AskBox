import { SearchView } from "@/components/SearchView";
import { getPublicAlgoliaConfig } from "@/lib/algolia-config";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const initialQuery = Array.isArray(params.q) ? params.q[0] ?? "" : params.q ?? "";
  const algoliaConfig = await getPublicAlgoliaConfig();
  return <SearchView algoliaConfig={algoliaConfig} initialQuery={initialQuery} />;
}
