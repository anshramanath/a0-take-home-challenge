"use client";

import React, { useState } from "react";

interface DiffItem {
  id: string;
  description: string;
  diff: string;
  url: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  diff: DiffItem;
  notes: { developer: string; marketing: string } | null;
  isLoading: boolean;
}

export default function DiffModal({ isOpen, onClose, diff, notes, isLoading }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-[2px] bg-black/20 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">PR #{diff.id}</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-red-500 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        <p className="mb-2 text-gray-700 dark:text-gray-300">
          <strong>Description:</strong> {diff.description}
        </p>
        <p className="mb-2 text-blue-600 dark:text-blue-400">
          <a href={diff.url} target="_blank" rel="noopener noreferrer">
            View on GitHub ↗
          </a>
        </p>

        <div className="mb-4">
          <h3 className="text-md font-semibold mb-1">Diff</h3>
          <div
            className={`bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto whitespace-pre-wrap transition-all duration-300 ${
              expanded ? "max-h-none" : "max-h-64 overflow-y-auto"
            }`}
          >
            <pre>{diff.diff}</pre>
          </div>
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {expanded ? "Collapse" : "Expand Full Diff"}
          </button>
        </div>

        <div className="mb-4">
          <h3 className="text-md font-semibold mb-1">Developer Notes</h3>
          <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm">
            {isLoading ? "Generating..." : notes?.developer || "No notes available."}
          </div>
        </div>

        <div className="mb-2">
          <h3 className="text-md font-semibold mb-1">Marketing Notes</h3>
          <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm">
            {isLoading ? "Generating..." : notes?.marketing || "No notes available."}
          </div>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}