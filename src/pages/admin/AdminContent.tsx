import { useEffect, useState } from "react";
import { Image as ImageIcon, RotateCcw, Save, Video } from "lucide-react";
import { defaultSiteContent, saveSiteContent, uploadSiteMedia, useSiteContent, type SiteContent } from "../../hooks/useSiteContent";

export default function AdminContent() {
  const live = useSiteContent();
  const [content, setContent] = useState<SiteContent>(live);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!live.loading) setContent(live);
  }, [live.loading]);

  const update = (key: keyof SiteContent, value: string | number | boolean) =>
    setContent(c => ({ ...c, [key]: value }));

  const upload = async (key: "logoUrl" | "heroOwnerImage" | "heroBackgroundImage" | "heroBackgroundVideo", kind: "logo" | "owner" | "background-image" | "background-video", file?: File) => {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const url = await uploadSiteMedia(file, kind);
      update(key, url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await saveSiteContent(content);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save site content.");
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    setContent(defaultSiteContent);
    setError("");
    setBusy(true);
    try {
      await saveSiteContent(defaultSiteContent);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset content.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <p className="font-display text-3xl">Site content</p>
          <p className="text-sm text-muted mt-2">These changes are stored in Supabase and control the public Jembe website.</p>
        </div>
        <button type="button" onClick={reset} disabled={busy} className="focus-ring inline-flex items-center gap-2 text-xs border border-stroke rounded-lg px-3 py-2 text-muted hover:text-ink disabled:opacity-50">
          <RotateCcw size={14} /> Reset defaults
        </button>
      </div>

      {error && <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">{error}</div>}

      <form onSubmit={save} className="space-y-6">
        <Panel title="Brand">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Site name"><input value={content.siteName} onChange={e => update("siteName", e.target.value)} className="admin-input" /></Field>
            <Field label="Logo letters"><input value={content.logoText} onChange={e => update("logoText", e.target.value)} className="admin-input" /></Field>
            <Field label="Motto"><input value={content.motto} onChange={e => update("motto", e.target.value)} className="admin-input" /></Field>
            <Field label="Logo URL"><input value={content.logoUrl} onChange={e => update("logoUrl", e.target.value)} className="admin-input" placeholder="Upload below or paste URL" /></Field>
          </div>
          <Upload label="Upload logo" icon={<ImageIcon size={14} />} onChange={f => upload("logoUrl", "logo", f)} />
        </Panel>

        <Panel title="Hero">
          <Field label="Eyebrow"><input value={content.heroEyebrow} onChange={e => update("heroEyebrow", e.target.value)} className="admin-input" /></Field>
          <Field label="Big headline"><textarea rows={3} value={content.heroHeadline} onChange={e => update("heroHeadline", e.target.value)} className="admin-input" /></Field>
          <Field label="Description"><textarea rows={4} value={content.heroDescription} onChange={e => update("heroDescription", e.target.value)} className="admin-input" /></Field>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Owner photo URL"><input value={content.heroOwnerImage} onChange={e => update("heroOwnerImage", e.target.value)} className="admin-input" placeholder="Upload below or paste URL" /></Field>
            <Field label="Background video URL"><input value={content.heroBackgroundVideo} onChange={e => update("heroBackgroundVideo", e.target.value)} className="admin-input" placeholder="Supabase Storage or public URL" /></Field>
            <Field label="Fallback background image URL"><input value={content.heroBackgroundImage} onChange={e => update("heroBackgroundImage", e.target.value)} className="admin-input" /></Field>
            <Field label={`Overlay ${content.heroOverlay}%`}><input type="range" min="0" max="95" value={content.heroOverlay} onChange={e => update("heroOverlay", Number(e.target.value))} className="w-full" /></Field>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <Toggle label="Show hero" value={content.heroVisible} onChange={v => update("heroVisible", v)} />
            <Toggle label="Show owner photo" value={content.showOwnerPhoto} onChange={v => update("showOwnerPhoto", v)} />
            <Toggle label="Show featured product" value={content.showFeaturedProduct} onChange={v => update("showFeaturedProduct", v)} />
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <Upload label="Owner photo" icon={<ImageIcon size={14} />} onChange={f => upload("heroOwnerImage", "owner", f)} />
            <Upload label="Fallback image" icon={<ImageIcon size={14} />} onChange={f => upload("heroBackgroundImage", "background-image", f)} />
            <Upload label="Background video" icon={<Video size={14} />} accept="video/mp4,video/webm,video/*" onChange={f => upload("heroBackgroundVideo", "background-video", f)} />
          </div>
        </Panel>

        <Panel title="Store">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Label"><input value={content.storeLabel} onChange={e => update("storeLabel", e.target.value)} className="admin-input" /></Field>
            <Field label="Headline"><input value={content.storeHeadline} onChange={e => update("storeHeadline", e.target.value)} className="admin-input" /></Field>
          </div>
          <Field label="Description"><textarea rows={3} value={content.storeDescription} onChange={e => update("storeDescription", e.target.value)} className="admin-input" /></Field>
        </Panel>

        <Panel title="Portfolio">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Label"><input value={content.portfolioLabel} onChange={e => update("portfolioLabel", e.target.value)} className="admin-input" /></Field>
            <Field label="Headline"><input value={content.portfolioHeadline} onChange={e => update("portfolioHeadline", e.target.value)} className="admin-input" /></Field>
          </div>
          <Field label="Description"><textarea rows={3} value={content.portfolioDescription} onChange={e => update("portfolioDescription", e.target.value)} className="admin-input" /></Field>
        </Panel>

        <Panel title="About & contact">
          <Field label="About label"><input value={content.aboutLabel} onChange={e => update("aboutLabel", e.target.value)} className="admin-input" /></Field>
          <Field label="About headline"><input value={content.aboutHeadline} onChange={e => update("aboutHeadline", e.target.value)} className="admin-input" /></Field>
          <Field label="About text"><textarea rows={4} value={content.aboutText} onChange={e => update("aboutText", e.target.value)} className="admin-input" /></Field>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Contact label"><input value={content.contactLabel} onChange={e => update("contactLabel", e.target.value)} className="admin-input" /></Field>
            <Field label="Contact headline"><input value={content.contactHeadline} onChange={e => update("contactHeadline", e.target.value)} className="admin-input" /></Field>
            <Field label="Contact description"><textarea rows={3} value={content.contactDescription} onChange={e => update("contactDescription", e.target.value)} className="admin-input" /></Field>
            <Field label="Contact email"><input type="email" value={content.contactEmail} onChange={e => update("contactEmail", e.target.value)} className="admin-input" /></Field>
          </div>
        </Panel>

        <Panel title="Social, announcement & footer">
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="GitHub"><input value={content.github} onChange={e => update("github", e.target.value)} className="admin-input" /></Field>
            <Field label="Twitter / X"><input value={content.twitter} onChange={e => update("twitter", e.target.value)} className="admin-input" /></Field>
            <Field label="LinkedIn"><input value={content.linkedin} onChange={e => update("linkedin", e.target.value)} className="admin-input" /></Field>
          </div>
          <Field label="Announcement"><input value={content.announcementText} onChange={e => update("announcementText", e.target.value)} className="admin-input" /></Field>
          <Toggle label="Show announcement" value={content.announcementVisible} onChange={v => update("announcementVisible", v)} />
          <Field label="Footer text"><textarea rows={3} value={content.footerText} onChange={e => update("footerText", e.target.value)} className="admin-input" /></Field>
        </Panel>

        <button type="submit" disabled={busy} className="focus-ring inline-flex items-center gap-2 bg-ink text-bg rounded-xl px-6 py-3 text-sm font-medium disabled:opacity-50">
          <Save size={15} /> {busy ? "Saving…" : saved ? "Saved" : "Save all site changes"}
        </button>
      </form>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="border border-stroke rounded-2xl p-6 bg-surface space-y-4"><p className="font-display text-xl">{title}</p>{children}</section>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-xs text-muted mb-1.5">{label}</span>{children}</label>;
}
function Upload({ label, icon, onChange, accept = "image/*" }: { label: string; icon: React.ReactNode; onChange: (f?: File) => void; accept?: string }) {
  return <label className="focus-ring cursor-pointer flex items-center gap-2 rounded-xl border border-dashed border-stroke px-4 py-3 text-sm text-muted hover:text-ink"><input type="file" accept={accept} className="sr-only" onChange={e => onChange(e.target.files?.[0])} />{icon}{label}</label>;
}
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return <button type="button" onClick={() => onChange(!value)} className={`focus-ring rounded-xl border p-3 text-left ${value ? "border-white/20 bg-white/5 text-ink" : "border-stroke text-muted"}`}><span className="block text-xs">{label}</span><span className="text-[11px] mt-1">{value ? "Visible" : "Hidden"}</span></button>;
}
