export function validateSocialUrl(url) {
  if (!url) return true;
  try {
    const u = new URL(url);
    return !!u.hostname;
  } catch {
    return false;
  }
}