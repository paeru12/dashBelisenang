export function buildMediaUrl(base, path) {
  if (!base || !path) return null;
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}
