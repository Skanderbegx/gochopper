import SearchClient from "./SearchClient";

export const dynamic = "force-dynamic";

export default function SearchPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Search</h1>
      <p className="text-muted mb-6">
        Search across posts and comments on xForge.
      </p>
      <SearchClient />
    </div>
  );
}
