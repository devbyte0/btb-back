function parseYouTubeEmbed(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return `https://www.youtube.com/embed/${m[1]}?autoplay=0&rel=0`;
  }
  return null;
}

function parseFacebookEmbed(url) {
  const videoPatterns = [
    /facebook\.com\/[^/]+\/videos\//,
    /facebook\.com\/watch\/?\?v=/,
    /facebook\.com\/[^/]+\/reels\//,
    /facebook\.com\/reel\//,
  ];
  for (const p of videoPatterns) {
    if (p.test(url)) {
      const isReel = /reel/i.test(url);
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=${isReel ? "267" : "500"}`;
    }
  }
  const postPatterns = [
    /facebook\.com\/[^/]+\/posts\//,
    /facebook\.com\/photo\/\?fbid=/,
    /facebook\.com\/permalink\.php/,
    /facebook\.com\/[^/]+\/activity\//,
    /facebook\.com\/story\.php/,
    /fb\.com\//,
  ];
  for (const p of postPatterns) {
    if (p.test(url)) {
      return `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}&show_text=true&width=500&height=600`;
    }
  }
  return null;
}

function parseInstagramEmbed(url) {
  const patterns = [
    /instagram\.com\/p\/([a-zA-Z0-9_-]+)/,
    /instagram\.com\/reel\/([a-zA-Z0-9_-]+)/,
    /instagr\.am\/p\/([a-zA-Z0-9_-]+)/,
    /instagr\.am\/reel\/([a-zA-Z0-9_-]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return `https://www.instagram.com/p/${m[1]}/embed`;
  }
  const anyMatch = /instagram\.com/i.test(url);
  if (anyMatch) return `https://www.instagram.com/p/${encodeURIComponent(url.split("/p/")[1]?.split("?")[0] || url.split("/reel/")[1]?.split("?")[0] || "")}/embed`;
  return null;
}

function parseTwitterEmbed(url) {
  if (/twitter\.com\/|x\.com\//i.test(url)) {
    const match = url.match(/twitter\.com\/(\w+)\/status\/(\d+)/) || url.match(/x\.com\/(\w+)\/status\/(\d+)/);
    if (match) return `https://platform.twitter.com/embed/Tweet.html?id=${match[2]}`;
    return url;
  }
  return null;
}

function parseTikTokEmbed(url) {
  const m = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
  if (m) return `https://www.tiktok.com/embed/v2/${m[1]}`;
  return null;
}

function parseVimeoEmbed(url) {
  const m = url.match(/vimeo\.com\/(\d+)/);
  if (m) return `https://player.vimeo.com/video/${m[1]}`;
  return null;
}

function parseMediaUrl(url) {
  const trimmed = url.trim();
  if (!trimmed) return { type: null, url: trimmed, embedUrl: null };

  const yt = parseYouTubeEmbed(trimmed);
  if (yt) return { type: "youtube", label: "YouTube Video", url: trimmed, embedUrl: yt };

  const fb = parseFacebookEmbed(trimmed);
  if (fb) return { type: "facebook", label: "Facebook Post", url: trimmed, embedUrl: fb };

  const ig = parseInstagramEmbed(trimmed);
  if (ig) return { type: "instagram", label: "Instagram Post", url: trimmed, embedUrl: ig };

  const tw = parseTwitterEmbed(trimmed);
  if (tw) return { type: "twitter", label: "X / Twitter", url: trimmed, embedUrl: tw };

  const tk = parseTikTokEmbed(trimmed);
  if (tk) return { type: "tiktok", label: "TikTok Video", url: trimmed, embedUrl: tk };

  const vm = parseVimeoEmbed(trimmed);
  if (vm) return { type: "vimeo", label: "Vimeo Video", url: trimmed, embedUrl: vm };

  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)(\?.*)?$/i.test(trimmed)) {
    return { type: "image", label: "Image", url: trimmed, embedUrl: null };
  }

  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmed)) {
    return { type: "video", label: "Video File", url: trimmed, embedUrl: null };
  }

  return { type: "embed", label: "Embedded Page", url: trimmed, embedUrl: trimmed };
}

module.exports = {
  parseMediaUrl,
  parseYouTubeEmbed,
  parseFacebookEmbed,
  parseInstagramEmbed,
  parseTwitterEmbed,
  parseTikTokEmbed,
  parseVimeoEmbed,
};
