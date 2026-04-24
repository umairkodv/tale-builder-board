import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Trash2, GripVertical, Save, Loader2, ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { storiesApi, type Slide, type Story } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/stories/$storyId")({
  component: StoryEditor,
});

function emptySlide(): Slide {
  return { imageUrl: "", duration: 5, ctaText: "", ctaUrl: "" };
}

function StoryEditor() {
  const { storyId } = useParams({ from: "/_app/stories/$storyId" });
  const isNew = storyId === "new";
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [published, setPublished] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([emptySlide()]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    storiesApi.get(storyId)
      .then((s: Story) => {
        setTitle(s.title);
        setPublished(s.published);
        setSlides(s.slides?.length ? s.slides : [emptySlide()]);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [storyId, isNew]);

  const updateSlide = (idx: number, patch: Partial<Slide>) => {
    setSlides((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const addSlide = () => {
    setSlides((prev) => [...prev, emptySlide()]);
    setActiveIdx(slides.length);
  };

  const removeSlide = (idx: number) => {
    if (slides.length === 1) return toast.error("At least one slide is required");
    setSlides((prev) => prev.filter((_, i) => i !== idx));
    setActiveIdx(Math.max(0, idx - 1));
  };

  const save = async () => {
    if (!title.trim()) return toast.error("Title is required");
    if (slides.some((s) => !s.imageUrl.trim())) return toast.error("Every slide needs an image URL");
    setSaving(true);
    try {
      const payload = { title: title.trim(), published, slides };
      const result = isNew
        ? await storiesApi.create(payload)
        : await storiesApi.update(storyId, payload);
      toast.success(isNew ? "Story created" : "Story saved");
      if (isNew) navigate({ to: "/stories/$storyId", params: { storyId: result.id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>;
  }

  const active = slides[activeIdx];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/stories"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{isNew ? "New story" : "Edit story"}</h1>
            <p className="text-muted-foreground text-sm mt-1">Build your slides and publish when ready.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-card">
            <Label htmlFor="pub" className="text-sm">Published</Label>
            <Switch id="pub" checked={published} onCheckedChange={setPublished} />
          </div>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save
          </Button>
        </div>
      </div>

      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <Label htmlFor="title">Story title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My awesome story" className="mt-2 max-w-lg" />
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-[280px_1fr_360px] gap-6">
        {/* Slide list */}
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm">Slides ({slides.length})</CardTitle>
            <Button size="sm" variant="outline" onClick={addSlide}><Plus className="h-3.5 w-3.5 mr-1" />Add</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {slides.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIdx(i)}
                className={`w-full flex items-center gap-2 p-2 rounded-md border text-left transition-colors ${
                  i === activeIdx ? "border-primary bg-accent" : "border-border hover:bg-muted"
                }`}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <div className="h-12 w-9 rounded bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  {s.imageUrl ? <img src={s.imageUrl} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Slide {i + 1}</p>
                  <p className="text-xs text-muted-foreground">{s.duration}s</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="shadow-soft">
          <CardHeader><CardTitle className="text-sm">Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="mx-auto rounded-2xl overflow-hidden bg-muted relative" style={{ aspectRatio: "9/16", maxWidth: 280 }}>
              {active?.imageUrl ? (
                <img src={active.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-10 w-10 opacity-40" />
                </div>
              )}
              {active?.ctaText && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white text-black text-center py-3 rounded-full text-sm font-medium shadow-elevated">
                    {active.ctaText}
                  </div>
                </div>
              )}
              <div className="absolute top-2 left-2 right-2 flex gap-1">
                {slides.map((_, i) => (
                  <div key={i} className={`h-0.5 flex-1 rounded-full ${i === activeIdx ? "bg-white" : "bg-white/40"}`} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Slide editor */}
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm">Slide {activeIdx + 1}</CardTitle>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeSlide(activeIdx)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="img">Image URL</Label>
              <Input id="img" value={active.imageUrl} onChange={(e) => updateSlide(activeIdx, { imageUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dur">Duration (seconds)</Label>
              <Input id="dur" type="number" min={1} max={60} value={active.duration} onChange={(e) => updateSlide(activeIdx, { duration: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cta">CTA text</Label>
              <Input id="cta" value={active.ctaText ?? ""} onChange={(e) => updateSlide(activeIdx, { ctaText: e.target.value })} placeholder="Shop now" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ctaUrl">CTA URL</Label>
              <Input id="ctaUrl" value={active.ctaUrl ?? ""} onChange={(e) => updateSlide(activeIdx, { ctaUrl: e.target.value })} placeholder="https://..." />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
