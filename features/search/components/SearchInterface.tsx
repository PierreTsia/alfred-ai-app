"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { useAuth } from "@clerk/nextjs";
import { DocumentChunk } from "@/convex/documents";
import { formatDistanceToNow } from "date-fns";
import { formatBytes } from "@/lib/utils";

// Shadcn components
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
  chunk: {
    content: string;
    metadata: {
      page: number;
      position: number;
    };
  } | null;
  file: {
    name: string;
  } | null;
  score: number | null;
  context: DocumentChunk[];
}

interface Props {
  documentId?: string;
}

export function SearchInterface({ documentId }: Props) {
  const { userId } = useAuth();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const search = useAction(api.documents.search);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch document metadata
  const document = useQuery(api.documents.getDocument, {
    documentId: documentId ?? "",
  });

  // Search when query changes
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || !userId) return;

    setIsSearching(true);
    try {
      const searchResults = await search({
        query: searchQuery,
        userId,
        limit: 5,
        includeContext: true,
        documentId, // Optional filter by document
      });
      setResults(searchResults as SearchResult[]);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Effect to trigger search on debounced query
  useEffect(() => {
    handleSearch(debouncedQuery);
  }, [debouncedQuery, userId]);

  if (documentId && !document) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Loading document...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {document && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold">
                {document.name}
              </CardTitle>
              <Badge variant="secondary">{formatBytes(document.size)}</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Uploaded</p>
              <p className="font-medium">
                {formatDistanceToNow(document.uploadedAt)} ago
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Chunks</p>
              <p className="font-medium">{document.chunkIds?.length ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Input
        type="search"
        placeholder={
          documentId ? "Search in this document..." : "Search all documents..."
        }
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full"
      />

      <div className="h-[600px] overflow-y-auto rounded-md border p-4">
        {isSearching ? (
          // Loading states
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-20 w-full animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : results.length > 0 ? (
          // Results display
          <div className="space-y-4">
            {results.map((result, index) => (
              <Card key={index}>
                {result.chunk && result.file && (
                  <>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          {result.file.name}
                        </CardTitle>
                        <Badge variant="secondary">
                          Page {result.chunk.metadata.page}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-2 text-sm text-muted-foreground">
                        {result.chunk.content}
                      </p>
                      {result.context.length > 0 && (
                        <div className="mt-2 border-t pt-2">
                          <p className="mb-1 text-xs text-muted-foreground">
                            Context:
                          </p>
                          {result.context.map((ctx, i) => (
                            <p
                              key={i}
                              className="text-xs text-muted-foreground"
                            >
                              {ctx.content}
                            </p>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </>
                )}
              </Card>
            ))}
          </div>
        ) : query ? (
          // No results state
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No results found for "{query}"
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
