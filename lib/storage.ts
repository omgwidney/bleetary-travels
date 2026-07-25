"use client";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function uploadProfileImage(
  uid: string,
  file: File,
): Promise<{ path: string; downloadUrl: string }> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Profile images must be JPEG, PNG, or WebP.");
  }
  if (file.size > MAX_PROFILE_IMAGE_BYTES) {
    throw new Error("Profile images must be 5 MB or smaller.");
  }

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `users/${uid}/profile/avatar.${extension}`;
  const imageRef = ref(storage, path);

  await uploadBytes(imageRef, file, {
    contentType: file.type,
    customMetadata: { ownerUid: uid, assetType: "profile" },
  });

  return { path, downloadUrl: await getDownloadURL(imageRef) };
}
