import { SearchInterface } from "@/features/search/components/SearchInterface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface DocumentMetadata {
  name: string;
  uploadedAt: number;
  size: number;
  chunkCount: number;
}

export default function DocumentPage({
  params,
}: {
  params: { documentId: string };
}) {
  return (
    <div className="container mx-auto space-y-8 py-8">
      {/* Document Metadata Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">
              Document Details
            </CardTitle>
            <Badge variant="secondary">PDF</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">loading...</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Uploaded</p>
            <p className="font-medium">loading...</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Size</p>
            <p className="font-medium">loading...</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Chunks</p>
            <p className="font-medium">loading...</p>
          </div>
        </CardContent>
      </Card>

      {/* Search Interface */}
      <div className="rounded-lg border bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SearchInterface documentId={params.documentId} />
      </div>
    </div>
  );
}
