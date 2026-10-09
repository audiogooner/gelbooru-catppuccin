/**
 * Resolve snapshotPages `discover` keys to concrete Gelbooru URLs by scraping
 * list-page HTML. Works with a HTML string (Node fetch) or live document markup.
 */

const BASE = "https://gelbooru.com/";

export const DISCOVER_SEEDS = {
  "post-view": "https://gelbooru.com/index.php?page=post&s=list&tags=all",
  "wiki-view": "https://gelbooru.com/index.php?page=wiki&s=list",
  "wiki-edit": "https://gelbooru.com/index.php?page=wiki&s=list",
  "wiki-history": "https://gelbooru.com/index.php?page=wiki&s=list",
  "tags-edit": "https://gelbooru.com/index.php?page=tags&s=list",
  "conversation-view":
    "https://gelbooru.com/index.php?page=conversation&s=list",
};

export function seedUrl(discover) {
  const url = DISCOVER_SEEDS[discover];
  if (!url) {
    throw new Error(`Unknown discover key: ${discover}`);
  }
  return url;
}

function sourceHtml(htmlOrDoc) {
  if (typeof htmlOrDoc === "string") {
    return htmlOrDoc;
  }
  if (htmlOrDoc?.documentElement?.outerHTML) {
    return htmlOrDoc.documentElement.outerHTML;
  }
  if (typeof htmlOrDoc?.outerHTML === "string") {
    return htmlOrDoc.outerHTML;
  }
  throw new Error("discoverUrl expects an HTML string or Document");
}

function firstGroup(html, pattern) {
  const match = html.match(pattern);
  return match?.[1] ?? null;
}

function absGelbooru(href) {
  return new URL(href.replaceAll("&amp;", "&"), BASE).href;
}

export function discoverUrl(discover, htmlOrDoc) {
  const html = sourceHtml(htmlOrDoc);

  if (discover === "post-view") {
    const id = firstGroup(
      html,
      /page=post&(?:amp;)?s=view&(?:amp;)?id=(\d+)/,
    );
    if (!id) {
      throw new Error("Could not discover a post-view id from the post list");
    }
    return `${BASE}index.php?page=post&s=view&id=${id}`;
  }

  if (discover === "wiki-view") {
    const id = firstGroup(
      html,
      /page=wiki&(?:amp;)?s=view&(?:amp;)?id=(\d+)/,
    );
    if (id) {
      return `${BASE}index.php?page=wiki&s=view&id=${id}`;
    }
    const href = firstGroup(
      html,
      /href="(index\.php\?page=wiki&(?:amp;)?s=(?:view|list)&(?:amp;)?search=[^"]+)"/,
    );
    if (!href) {
      throw new Error("Could not discover a wiki page URL");
    }
    return absGelbooru(href);
  }

  if (discover === "wiki-edit" || discover === "wiki-history") {
    const id =
      firstGroup(html, /page=wiki&(?:amp;)?s=view&(?:amp;)?id=(\d+)/) ||
      firstGroup(html, /page=wiki&(?:amp;)?s=edit&(?:amp;)?id=(\d+)/);
    if (!id) {
      throw new Error(`Could not discover a wiki id for ${discover}`);
    }
    const s = discover === "wiki-edit" ? "edit" : "history";
    return `${BASE}index.php?page=wiki&s=${s}&id=${id}`;
  }

  if (discover === "tags-edit") {
    const tag = firstGroup(
      html,
      /page=tags&(?:amp;)?s=edit&(?:amp;)?tag=([^"'&\s<>]+)/,
    );
    if (!tag) {
      throw new Error("Could not discover a tags-edit tag from the tags list");
    }
    return `${BASE}index.php?page=tags&s=edit&tag=${tag}`;
  }

  if (discover === "conversation-view") {
    const id = firstGroup(
      html,
      /page=conversation&(?:amp;)?s=view&(?:amp;)?id=(\d+)/,
    );
    if (!id) {
      throw new Error(
        "Could not discover a conversation-view id from the conversation list",
      );
    }
    return `${BASE}index.php?page=conversation&s=view&id=${id}`;
  }

  throw new Error(`Unknown discover key: ${discover}`);
}

/** True when `href` is the list page used to discover `discover`. */
export function isDiscoverSeed(href, discover) {
  const seed = new URL(seedUrl(discover));
  const current = new URL(href, BASE);
  const seedPage = seed.searchParams.get("page");
  const seedS = seed.searchParams.getAll("s").find(Boolean) || "";
  const page = current.searchParams.get("page");
  const s = current.searchParams.getAll("s").find(Boolean) || "";
  return page === seedPage && s === seedS;
}
