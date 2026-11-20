// Mirrors the backend's limits (LocalFileStorageService) so people get
// instant feedback instead of waiting for a round-trip failure. This is
// convenience only, not a security boundary — the backend enforces the
// real limit regardless of what the frontend allows through.
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_FILES_PER_UPLOAD = 5;
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];

export interface FileValidationResult {
  accepted: File[];
  rejectedMessages: string[];
}

// Filters a batch of newly-picked files against size/type/count rules,
// combined with however many the person already has staged.
export function validateFiles(newFiles: File[], alreadyStagedCount: number): FileValidationResult {
  const accepted: File[] = [];
  const rejectedMessages: string[] = [];
  let count = alreadyStagedCount;

  for (const file of newFiles) {
    const extension = "." + (file.name.split(".").pop() ?? "").toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      rejectedMessages.push(`"${file.name}" isn't an allowed file type (JPG, PNG, WEBP, PDF only)`);
      continue;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      rejectedMessages.push(`"${file.name}" is too large (max 5MB per file)`);
      continue;
    }
    if (count >= MAX_FILES_PER_UPLOAD) {
      rejectedMessages.push(`"${file.name}" was skipped — maximum ${MAX_FILES_PER_UPLOAD} files per upload`);
      continue;
    }
    accepted.push(file);
    count += 1;
  }

  return { accepted, rejectedMessages };
}
