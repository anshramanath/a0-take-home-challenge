"use client";

import { useEffect, useState } from "react";
import DiffModal from "./components/DiffModal";

interface DiffItem {
  id: string;
  description: string;
  diff: string;
  url: string;
}

interface ApiResponse {
  diffs: DiffItem[];
  nextPage: number | null;
  currentPage: number;
  perPage: number;
}

export default function Home() {
  const [diffs, setDiffs] = useState<DiffItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [selectedDiff, setSelectedDiff] = useState<DiffItem | null>(null);
  const [notes, setNotes] = useState<{ developer: string; marketing: string } | null>(null);
  const [generating, setGenerating] = useState(false);

  const fetchDiffs = async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sample-diffs?page=${page}&per_page=10`);
      const data: ApiResponse = await res.json();
      setDiffs((prev) => {
        const newDiffs = data.diffs ?? [];
        return page === 1 ? newDiffs : [...prev, ...newDiffs];
      });
      setCurrentPage(data.currentPage);
      setNextPage(data.nextPage);
      setInitialFetchDone(true);
    } catch (err: any) {
      setError(err.message || "Failed to load diffs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchClick = () => {
    setDiffs([]);
    fetchDiffs(1);
  };

  const handleLoadMoreClick = () => {
    if (nextPage) fetchDiffs(nextPage);
  };

  const handleDiffClick = async (diff: DiffItem) => {
    setSelectedDiff(diff);
    setNotes(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diff: diff.diff }),
      });
      const data = await res.json();
      setNotes(data);
    } catch (e) {
      setNotes({ developer: "Error generating notes", marketing: "" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-12 sm:p-24">
      <h1 className="text-4xl font-extrabold tracking-tight mb-8 text-center">
        Diff Digest <span role="img" aria-label="writing">✍️</span>
      </h1>

      <div className="w-full max-w-4xl">
        <div className="mb-8 flex justify-center">
          <button
            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white font-medium rounded-md shadow hover:bg-blue-700 transition-colors disabled:opacity-50"
            onClick={handleFetchClick}
            disabled={isLoading}
          >
            {isLoading && currentPage === 1 ? "Fetching..." : "🔄 Fetch Latest Diffs"}
          </button>
        </div>

        <div className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-800">
          <h2 className="text-2xl font-semibold mb-4">Merged Pull Requests</h2>

          {error && <div className="text-red-500">Error: {error}</div>}

          {!isLoading && initialFetchDone && diffs.length === 0 && (
            <p className="text-gray-500 text-center italic mb-4">
              No pull requests found.
            </p>
          )}

          {diffs.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {diffs.map((item) => (
                <div
                  key={item.id}
                  className="cursor-pointer border rounded-md p-4 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md hover:border-blue-400 transition duration-200"
                  onClick={() => handleDiffClick(item)}
                >
                  <h3 className="font-medium text-lg text-blue-600">PR #{item.id}</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{item.description}</p>
                </div>
              ))}
            </div>
          )}

          {nextPage && !isLoading && (
            <div className="mt-6 text-center">
              <button
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition"
                onClick={handleLoadMoreClick}
              >
                Load More (Page {nextPage})
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedDiff && (
        <DiffModal
          isOpen={!!selectedDiff}
          onClose={() => setSelectedDiff(null)}
          diff={selectedDiff}
          notes={notes}
          isLoading={generating}
        />
      )}
    </main>
  );
}