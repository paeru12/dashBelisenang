export function extractUsername(url, platform) {
  if (!url) return "";

  try {
    const u = new URL(url);

    switch (platform) {
      case "instagram":
        return u.pathname.replace("/", "");
      case "tiktok":
        return u.pathname.replace("/", "").replace("@", "");
      case "facebook":
        return u.pathname.split("/")[1] || "";
      case "youtube":
        return u.pathname.replace("/", "").replace("@", "");
      case "website":
        return u.hostname || "";
      default:
        return "";
    }
  } catch {
    return "";
  }
}