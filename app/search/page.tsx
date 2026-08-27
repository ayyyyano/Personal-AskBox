import { Suspense } from "react";
import { SearchView } from "@/components/SearchView";
import { getPublicAlgoliaConfig } from "@/lib/algolia-config";

export default async function SearchPage() {
  const algoliaConfig = await getPublicAlgoliaConfig();
  return (
    <Suspense fallback={null}>
      <SearchView algoliaConfig={algoliaConfig} />
    </Suspense>
  );
}
