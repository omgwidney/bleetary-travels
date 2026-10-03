"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { getDownloadURL, ref, uploadBytesResumable, type UploadTask } from "firebase/storage";
import { auth, storage } from "@/lib/firebase";
import { adminTripSchema, MAX_TRIP_IMAGE_BYTES, TRIP_IMAGE_TYPES, type AdminTripInput } from "@/lib/validation/admin-trip";

interface Option { id: string; name: string; status?: string }
type Photo = AdminTripInput["images"][number];
const field = "mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100";
const secondary = "rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50";

export default function TripEditor({ hosts, destinations }: { hosts: Option[]; destinations: Option[] }) {
  const [days, setDays] = useState([{ title: "Arrival & welcome", description: "", activities: "" }]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [destinationId, setDestinationId] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [upload, setUpload] = useState<{ name: string; progress: number } | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<{ slug: string; status: string } | null>(null);
  const task = useRef<UploadTask | null>(null);
  const busy = saving || upload !== null;

  async function uploadPhotos(files: File[]) {
    setError("");
    if (files.length + photos.length > 20) { setError("Choose up to 20 images per trip."); return; }
    for (const file of files) {
      if (!TRIP_IMAGE_TYPES.includes(file.type) || file.size === 0 || file.size > MAX_TRIP_IMAGE_BYTES) {
        setError(`${file.name}: use JPEG, PNG, WebP or AVIF, up to 100 MiB per image. Export HEIC or RAW photos to a supported format before uploading.`); return;
      }
    }
    try {
      setUpload({ name: "Preparing upload", progress: 0 });
      await auth.authStateReady();
      if (!auth.currentUser) throw new Error("Sign in again before uploading images.");
      const token = await auth.currentUser.getIdTokenResult(true);
      if (token.claims.role !== "admin") throw new Error("An admin account is required to upload trip images.");
      for (const file of files) {
        const name = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120);
        const path = `published/trip-originals/${auth.currentUser.uid}-${crypto.randomUUID()}-${name}`;
        setUpload({ name: file.name, progress: 0 });
        const uploadTask = uploadBytesResumable(ref(storage, path), file, {
          contentType: file.type,
          cacheControl: "public,max-age=31536000,immutable",
          customMetadata: { ownerUid: auth.currentUser.uid, originalName: file.name, preservation: "original-bytes" },
        });
        task.current = uploadTask;
        await new Promise<void>((resolve, reject) => uploadTask.on("state_changed", snapshot => {
          setUpload({ name: file.name, progress: Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100) });
        }, reject, resolve));
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        setPhotos(previous => [...previous, { path, url, name: file.name, size: file.size, contentType: file.type as Photo["contentType"] }]);
      }
    } catch (caught) {
      const code = typeof caught === "object" && caught && "code" in caught ? String(caught.code) : "";
      setError(code === "storage/canceled" ? "Upload cancelled. Completed uploads are still available below." : code === "storage/unauthorized" ? "Storage denied the upload. Sign in again with your admin account and ensure the trip image Storage rules are deployed." : caught instanceof Error ? caught.message : "Upload failed. Try again.");
    } finally { setUpload(null); task.current = null; }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const data = new FormData(event.currentTarget);
    const value = (name: string) => String(data.get(name) ?? "").trim();
    const input = {
      title: value("title"), slug, tagline: value("tagline"), hostUid: value("hostUid"), destinationId,
      destination: { name: value("destinationName"), country: value("country"), countryCode: value("countryCode").toUpperCase(), region: value("region"), description: value("destinationDescription") },
      startDate: value("startDate"), endDate: value("endDate"), basePriceCents: Math.round(Number(value("price")) * 100), capacity: Number(value("capacity")), depositPercent: Number(value("depositPercent")), finalBalanceDueDays: Number(value("finalBalanceDueDays")),
      status: value("status"), tags: value("tags").split(",").map(s => s.trim()).filter(Boolean), images: photos,
      days: days.map(day => ({ ...day, activities: day.activities.split("\n").map(s => s.trim()).filter(Boolean) })),
    };
    const parsed = adminTripSchema.safeParse(input);
    if (!parsed.success) { setError(parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(" ")); return; }
    setSaving(true);
    try {
      const response = await fetch("/api/admin/trips", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to save trip.");
      setSaved(result);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to save trip. Your form has been kept."); }
    finally { setSaving(false); }
  }

  if (saved) return <section className="rounded-3xl border border-teal-200 bg-white p-8 space-y-4" role="status">
    <h2 className="text-2xl font-bold">Trip {saved.status === "published" ? "published" : "saved as a draft"}</h2>
    <p>The trip, daily itinerary, assigned host and departure were saved together. Your original photos are preserved.</p>
    <div className="flex gap-4"><Link href="/admin" className="font-bold text-teal-700">Return to admin workspace</Link>{saved.status === "published" && <Link href={`/trips/${saved.slug}`} className="font-bold text-teal-700">View trip →</Link>}</div>
  </section>;

  return <form onSubmit={save} className="space-y-6">
    {hosts.length === 0 && <p role="alert" className="rounded-xl bg-amber-50 p-4 text-amber-900">No approved hosts are available. Approve a host application in the <Link href="/admin" className="underline">Host Queue</Link> to create their host profile, then return here.</p>}
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</p>}
    <fieldset disabled={busy} className="space-y-6 disabled:opacity-75">
      <section className="rounded-3xl border bg-white p-6 sm:p-8 space-y-5">
        <h2 className="text-xl font-bold">1. Trip details & host</h2>
        <label className="block text-sm font-semibold">Trip title<input name="title" required maxLength={150} className={field} onChange={event => { if (!slugEdited) setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")); }} /></label>
        <label className="block text-sm font-semibold">Trip address (slug)<input required value={slug} onChange={event => { setSlugEdited(true); setSlug(event.target.value); }} className={field} /><span className="text-xs font-normal text-slate-500">/trips/{slug || "your-trip-name"}</span></label>
        <label className="block text-sm font-semibold">Trip introduction<textarea name="tagline" required minLength={10} maxLength={500} rows={3} className={field} /></label>
        <div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-semibold">Assigned host<select name="hostUid" required defaultValue="" className={field}><option value="" disabled>Select an approved host</option>{hosts.map(host => <option key={host.id} value={host.id}>{host.name}</option>)}</select></label>
        <label className="block text-sm font-semibold">Tags<input name="tags" placeholder="Adventure, Wildlife, Culture" className={field} /><span className="text-xs font-normal text-slate-500">Separate tags with commas.</span></label></div>
      </section>
      <section className="rounded-3xl border bg-white p-6 sm:p-8 space-y-5">
        <h2 className="text-xl font-bold">2. Destination</h2>
        <label className="block text-sm font-semibold">Destination<select value={destinationId} onChange={event => setDestinationId(event.target.value)} className={field}><option value="">Create a new destination</option>{destinations.map(destination => <option key={destination.id} value={destination.id}>{destination.name} ({destination.status})</option>)}</select></label>
        {!destinationId && <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">Destination name<input name="destinationName" required className={field} placeholder="Victoria Falls" /></label>
          <label className="text-sm font-semibold">Country<input name="country" required className={field} placeholder="Zimbabwe" /></label>
          <label className="text-sm font-semibold">Two-letter country code<input name="countryCode" required minLength={2} maxLength={2} className={field} placeholder="ZW" /></label>
          <label className="text-sm font-semibold">Region<input name="region" required className={field} placeholder="Southern Africa" /></label>
          <label className="text-sm font-semibold sm:col-span-2">Destination description<textarea name="destinationDescription" required minLength={10} rows={3} className={field} /></label>
        </div>}
      </section>
      <section className="rounded-3xl border bg-white p-6 sm:p-8 space-y-5">
        <h2 className="text-xl font-bold">3. Departure & pricing</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-semibold">Start date<input type="date" name="startDate" required className={field} /></label>
          <label className="text-sm font-semibold">End date<input type="date" name="endDate" required className={field} /></label>
          <label className="text-sm font-semibold">Price per traveler (USD)<input type="number" name="price" required min="1" max="1000000" step="0.01" className={field} /></label>
          <label className="text-sm font-semibold">Available places<input type="number" name="capacity" required min="1" max="500" defaultValue="12" className={field} /></label>
          <label className="text-sm font-semibold">Deposit (%)<input type="number" name="depositPercent" required min="1" max="100" defaultValue="30" className={field} /></label>
          <label className="text-sm font-semibold">Balance due (days before departure)<input type="number" name="finalBalanceDueDays" required min="0" max="365" defaultValue="60" className={field} /></label>
        </div>
      </section>
      <section className="rounded-3xl border bg-white p-6 sm:p-8 space-y-5">
        <h2 className="text-xl font-bold">4. Daily itinerary</h2>
        {days.map((day, index) => <div key={index} className="rounded-2xl bg-slate-50 p-5 space-y-3">
          <div className="flex items-center justify-between"><h3 className="font-bold">Day {index + 1}</h3><button type="button" className={secondary} disabled={days.length === 1} onClick={() => setDays(days.filter((_, i) => i !== index))}>Remove day {index + 1}</button></div>
          <label className="block text-sm font-semibold">Day {index + 1} title<input required minLength={2} className={field} value={day.title} onChange={event => setDays(days.map((d, i) => i === index ? { ...d, title: event.target.value } : d))} /></label>
          <label className="block text-sm font-semibold">Day {index + 1} description<textarea required minLength={5} rows={3} className={field} value={day.description} onChange={event => setDays(days.map((d, i) => i === index ? { ...d, description: event.target.value } : d))} /></label>
          <label className="block text-sm font-semibold">Day {index + 1} activities (one per line)<textarea rows={3} className={field} value={day.activities} onChange={event => setDays(days.map((d, i) => i === index ? { ...d, activities: event.target.value } : d))} /></label>
        </div>)}
        <button type="button" className={secondary} disabled={days.length >= 60} onClick={() => setDays([...days, { title: "", description: "", activities: "" }])}>+ Add itinerary day</button>
      </section>
      <section className="rounded-3xl border bg-white p-6 sm:p-8 space-y-5">
        <h2 className="text-xl font-bold">5. Original trip photos</h2>
        <p className="text-sm text-slate-600">Upload from your Mac: JPEG, PNG, WebP or AVIF, up to 100 MiB each and 20 photos per trip. Files keep their original resolution and bytes—no resizing or recompression. Export HEIC or RAW images first. The first photo is the cover.</p>
        <p className="text-xs text-slate-500">Uploaded trip photos are publicly accessible by link, including photos for drafts. Removing one here removes it from this trip; the uploaded original stays in your media storage.</p>
        <label className="block text-sm font-semibold">Choose photos<input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className={field} onChange={event => { const files = Array.from(event.target.files ?? []); event.target.value = ""; void uploadPhotos(files); }} /></label>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{photos.map((photo, index) => <div key={photo.path} className="overflow-hidden rounded-xl border bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.url} alt={photo.name} className="h-40 w-full object-cover" />
          <div className="p-3 space-y-2"><p className="truncate text-sm font-semibold">{index === 0 ? "Cover · " : ""}{photo.name}</p><p className="text-xs text-slate-500">{(photo.size / 1024 / 1024).toFixed(2)} MiB · Original</p><a href={photo.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-teal-700">Open full-quality original ↗</a><div className="flex gap-2">{index !== 0 && <button type="button" className={secondary} onClick={() => setPhotos([photo, ...photos.filter(p => p.path !== photo.path)])}>Make cover</button>}<button type="button" className={secondary} onClick={() => setPhotos(photos.filter(p => p.path !== photo.path))}>Remove</button></div></div>
        </div>)}</div>
      </section>
      <section className="rounded-3xl border bg-white p-6 sm:p-8 flex flex-wrap items-end justify-between gap-4">
        <label className="text-sm font-semibold">Visibility<select name="status" defaultValue="draft" className={field}><option value="draft">Save as draft</option><option value="published">Publish to the trip catalog</option></select></label>
        <button type="submit" disabled={hosts.length === 0 || photos.length === 0} className="rounded-xl bg-teal-700 px-6 py-3 font-bold text-white hover:bg-teal-800 disabled:opacity-50">{saving ? "Saving trip…" : "Save trip"}</button>
      </section>
    </fieldset>
    {upload && <div role="status" className="sticky bottom-4 rounded-xl bg-slate-900 p-4 text-white shadow-xl"><p>{upload.name} · {upload.progress}%</p><progress className="mt-2 w-full" max={100} value={upload.progress} /><button type="button" onClick={() => task.current?.cancel()} className="mt-2 text-sm underline">Cancel upload</button></div>}
  </form>;
}
