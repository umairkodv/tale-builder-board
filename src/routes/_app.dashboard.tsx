import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, Eye, KeyRound, TrendingUp, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { storiesApi, apiKeysApi, type Story } from "@/lib/api";

export const Route = createFileRoute("/_app/dashboard")({
  component: Overview,
});

function StatCard({ icon: Icon, label, value, hint }: { icon: typeof BookOpen; label: string; value: string | number; hint?: string }) {
  return (
    <Card className="shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className="h-8 w-8 rounded-md bg-accent flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function Overview() {
  const [stories, setStories] = useState<Story[]>([]);
  const [keysCount, setKeysCount] = useState(0);

  useEffect(() => {
    storiesApi.list().then(setStories).catch(() => setStories([]));
    apiKeysApi.list().then((k) => setKeysCount(k.length)).catch(() => setKeysCount(0));
  }, []);

  const published = stories.filter((s) => s.published).length;
  const totalViews = stories.reduce((sum, s) => sum + (s.views ?? 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">Welcome back. Here's what's happening with your stories.</p>
        </div>
        <Button asChild>
          <Link to="/stories/$storyId" params={{ storyId: "new" }}><Plus className="h-4 w-4 mr-2" />New story</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Total stories" value={stories.length} hint="All stories in your account" />
        <StatCard icon={TrendingUp} label="Published" value={published} hint={`${stories.length - published} drafts`} />
        <StatCard icon={Eye} label="Total views" value={totalViews.toLocaleString()} hint="Across all widgets" />
        <StatCard icon={KeyRound} label="API keys" value={keysCount} hint="Active keys" />
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Recent stories</CardTitle>
        </CardHeader>
        <CardContent>
          {stories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
              No stories yet. Create your first one to get started.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {stories.slice(0, 5).map((s) => (
                <li key={s.id} className="py-3 flex items-center justify-between">
                  <div>
                    <Link to="/stories/$storyId" params={{ storyId: s.id }} className="font-medium hover:underline">{s.title}</Link>
                    <p className="text-xs text-muted-foreground">{s.slides?.length ?? 0} slides · {s.published ? "Published" : "Draft"}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${s.published ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                    {s.published ? "Live" : "Draft"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
