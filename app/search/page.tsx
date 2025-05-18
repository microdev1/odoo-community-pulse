import { Header } from "@/components/header";
import { SearchResults } from "./search-results";

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">
          Search Results for "{query}"
        </h1>
        <SearchResults query={query} />
      </main>
    </div>
  );
}
