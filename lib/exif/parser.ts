// EXIF metadata extraction — browser-only, always safe (never throws)
// Uses exifr@7.1.3 which handles JPEG, HEIC, WEBP, PNG

export interface ExifResult {
  lat:        number | null;  // decimal degrees, negative = South
  lng:        number | null;  // decimal degrees, negative = West
  capturedAt: Date | null;    // DateTimeOriginal from camera
  device:     string | null;  // "Make Model" e.g. "Apple iPhone 15 Pro"
  present:    boolean;        // true if ANY exif field was extracted
  ageWarning: boolean;        // true if capturedAt is > 7 days before now
  gpsPresent: boolean;        // true if GPS coordinates were found
}

export async function extractExif(file: File): Promise<ExifResult> {
  const empty: ExifResult = {
    lat: null, lng: null, capturedAt: null,
    device: null, present: false, ageWarning: false, gpsPresent: false,
  };

  try {
    // Dynamic import keeps exifr out of the server bundle
    const exifr = (await import("exifr")).default;

    // GPS convenience method — returns {latitude, longitude} or undefined
    const coords = await exifr.gps(file).catch(() => null);

    // Date + device tags — translateValues:true parses date strings into Date objects
    const tags = await exifr
      .parse(file, {
        pick: ["DateTimeOriginal", "DateTime", "Model", "Make"],
        translateValues: true,
      })
      .catch(() => null);

    const lat = coords?.latitude  ?? null;
    const lng = coords?.longitude ?? null;

    let capturedAt: Date | null = null;
    const rawDate = tags?.DateTimeOriginal ?? tags?.DateTime;
    if (rawDate instanceof Date && !isNaN(rawDate.getTime())) {
      capturedAt = rawDate;
    } else if (typeof rawDate === "string") {
      // EXIF format is "YYYY:MM:DD HH:MM:SS" — normalise to ISO
      const iso = rawDate.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3");
      const d = new Date(iso);
      if (!isNaN(d.getTime())) capturedAt = d;
    }

    const make  = typeof tags?.Make  === "string" ? tags.Make.trim()  : "";
    const model = typeof tags?.Model === "string" ? tags.Model.trim() : "";
    // Avoid "Apple Apple iPhone 15 Pro" duplication
    const device =
      make && model
        ? model.toLowerCase().startsWith(make.toLowerCase())
          ? model
          : `${make} ${model}`
        : model || make || null;

    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const ageWarning = capturedAt !== null && Date.now() - capturedAt.getTime() > sevenDays;
    const gpsPresent = lat !== null && lng !== null;
    const present    = gpsPresent || capturedAt !== null || device !== null;

    return { lat, lng, capturedAt, device, present, ageWarning, gpsPresent };
  } catch {
    return empty;
  }
}

/** Build the proof commitment hash: SHA-256(evidenceHash | lat | lng | capturedAt ISO) */
export async function buildProofHash(
  evidenceHash: string,
  exif: Pick<ExifResult, "lat" | "lng" | "capturedAt">
): Promise<string> {
  const payload =
    evidenceHash +
    "|" + (exif.lat  !== null ? exif.lat.toFixed(7)  : "null") +
    "|" + (exif.lng  !== null ? exif.lng.toFixed(7)  : "null") +
    "|" + (exif.capturedAt   ? exif.capturedAt.toISOString() : "null");

  const buf  = new TextEncoder().encode(payload);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}
