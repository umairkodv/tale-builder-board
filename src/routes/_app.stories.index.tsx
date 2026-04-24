import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Search, MoreHorizontal, Trash2, Edit, Eye, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { storiesApi, type Story } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/stories/")({
  component: StoriesList,
});

function StoriesList() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    storiesApi.list()
      .then(setStories)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const togglePublish = async (s: Story) => {
    try {
      const updated = await storiesApi.publish(s.id, !s.published);
      setStories((prev) => prev.map((x) => (x.id === s.id ? updated : x)));
      toast.success(updated.published ? "Story published" : "Story unpublished");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this story? This cannot be undone.")) return;
    try {
      await storiesApi.delete(id);
      setStories((prev) => prev.filter((s) => s.id !== id));
      toast.success("Story deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const filtered = stories.filter((s) => s.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Stories</h1>
          <p className="text-muted-foreground text-sm mt-1">Create, edit and publish your story widgets.</p>
        </div>
        <Button asChild>
          <Link to="/stories/$storyId" params={{ storyId: "new" }}><Plus className="h-4 w-4 mr-2" />New story</Link>
        </Button>
      </div>

      <Card className="shadow-soft">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search stories..." className="pl-9" />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-muted-foreground text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <BookOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="font-medium">No stories yet</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Get started by creating your first story.</p>
            <Button asChild><Link to="/stories/$storyId" params={{ storyId: "new" }}><Plus className="h-4 w-4 mr-2" />New story</Link></Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slides</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id} className="cursor-pointer" onClick={() => navigate({ to: "/stories/$storyId", params: { storyId: s.id } })}>
                  <TableCell className="font-medium">{s.title}</TableCell>
                  <TableCell className="text-muted-foreground">{s.slides?.length ?? 0}</TableCell>
                  <TableCell>
                    <Badge variant={s.published ? "default" : "secondary"} className={s.published ? "bg-success/10 text-success hover:bg-success/15" : ""}>
                      {s.published ? "Live" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Switch checked={s.published} onCheckedChange={() => togglePublish(s)} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate({ to: "/stories/$storyId", params: { storyId: s.id } })}>
                          <Edit className="h-4 w-4 mr-2" />Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => togglePublish(s)}>
                          <Eye className="h-4 w-4 mr-2" />{s.published ? "Unpublish" : "Publish"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => remove(s.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
