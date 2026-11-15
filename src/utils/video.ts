const YOUTUBE_EMBED_PREFIX = "https://www.youtube.com/embed/"

/** True when the URL points to an actual video (not empty, null, or just the embed prefix). */
export function hasRuleVideo(url: string | null | undefined): url is string {
  const trimmed = url?.trim() ?? ""
  return trimmed !== "" && trimmed !== YOUTUBE_EMBED_PREFIX
}
