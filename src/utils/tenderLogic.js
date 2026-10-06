/**
 * Evaluates the status of a requirement based on matching and expiry rules.
 * Plain "YYYY-MM-DD" string comparison is used (no timezone/Date math).
 */
export function getRequirementStatus(req, matchedFile, expiryDate, submissionDeadline) {
  if (!matchedFile) {
    return req.mandatory ? "Missing" : "Not provided";
  }

  if (req.has_expiry) {
    if (!expiryDate) {
      return "Expiry date needed";
    }
    if (expiryDate < submissionDeadline) {
      return "Expired";
    }
  }

  return "OK";
}

export async function computeFileHash(arrayBuffer) {
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function validatePdfFile(file) {
  if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
    return { valid: false, error: "Invalid file type. Must be a PDF." };
  }

  const slice = file.slice(0, 5);
  const buffer = await slice.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const header = String.fromCharCode(...bytes);

  if (!header.startsWith("%PDF")) {
    return { valid: false, error: "File is missing valid PDF header bytes." };
  }

  return { valid: true };
}
