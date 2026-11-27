const byId = (id) => document.getElementById(id);
const cleanText = (value) => typeof value === "string" ? value.trim() : "";

function safeURL(value, base, protocols) {
  const input = cleanText(value);
  if (!input) return null;

  try {
    const url = new URL(input, base);
    if (protocols.includes(url.protocol) && !url.username && !url.password) {
      return url;
    }
  } catch {
    return null;
  }

  return null;
}

function configURL() {
  const source = document.querySelector('meta[name="orcalink-config"]').content;
  const url = safeURL(source, location.href, ["https:", "http:"]);
  const isSameOrigin = url?.origin === location.origin;
  const isGitHubRaw = url?.origin === "https://raw.githubusercontent.com";

  if (!isSameOrigin && !isGitHubRaw) {
    throw new Error("Use a same-origin configuration or a public GitHub Raw URL.");
  }

  return url;
}

function setImage(id, value, base, frame = byId(id)) {
  const image = byId(id);
  const url = safeURL(value, base, ["https:", "http:"]);
  if (!url || (url.protocol === "http:" && url.origin !== location.origin)) return;

  image.addEventListener("error", () => { frame.hidden = true; }, { once: true });
  image.src = url.href;
  frame.hidden = false;
}

const icons = new Map([
  ["globe", ""],
  ["code", "{ }"],
  ["guide", ""],
  ["default", ""]
]);

function renderLink(item, { urlFor, element }) {
  const title = cleanText(item.title);
  const url = urlFor(item.url);
  if (!title || !url) return null;

  const iconName = icons.has(item.icon) ? item.icon : "default";
  const icon = element("span", `icon icon-${iconName}`, icons.get(iconName));
  icon.setAttribute("aria-hidden", "true");
  const arrow = element("span", "link-arrow");
  arrow.setAttribute("aria-hidden", "true");

  const copy = element("span", "link-copy");
  copy.append(element("span", "link-title", title));
  const description = cleanText(item.description);
  if (description) copy.append(element("span", "link-description", description));

  const link = element("a", "link");
  link.href = url.href;
  link.append(icon, copy, arrow);
  return link;
}

function element(tag, className, text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = text;
  return node;
}

// Register trusted, locally written renderers here.
const renderers = new Map([["link", renderLink]]);

function render(config, base) {
  const name = cleanText(config?.name);
  if (config?.version !== 1 || !name || !Array.isArray(config.links)) {
    throw new Error("Expected version 1, a name, and a links array.");
  }

  document.title = name;
  byId("name").textContent = name;
  byId("initial").textContent = Array.from(name)[0].toLocaleUpperCase();

  const bio = cleanText(config.bio);
  byId("bio").textContent = bio;
  byId("bio").hidden = !bio;
  document.querySelector('meta[name="description"]').content = bio || name;
  setImage("cover", config.cover, base, byId("cover-frame"));
  setImage("avatar", config.avatar, base);

  const context = {
    element,
    urlFor: (value) => safeURL(value, base, ["https:", "http:", "mailto:", "tel:"])
  };
  const links = byId("links");

  for (const item of config.links) {
    if (!item || typeof item !== "object") continue;
    const renderer = renderers.get(item.type ?? "link");
    if (!renderer) continue;

    try {
      const content = renderer(item, context);
      if (!content) continue;
      const row = element("li");
      row.append(content);
      links.append(row);
    } catch (error) {
      console.warn("Could not render an OrcaLink entry.", error);
    }
  }

  byId("link-nav").hidden = !links.childElementCount;
  byId("empty").hidden = !!links.childElementCount;
  byId("profile").hidden = false;
}

async function start() {
  const status = byId("status");
  status.hidden = false;

  try {
    const url = configURL();
    const response = await fetch(url, {
      cache: "no-cache",
      credentials: "omit",
      redirect: "error",
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) throw new Error(`Configuration request returned ${response.status}.`);

    render(await response.json(), url);
    status.hidden = true;
  } catch (error) {
    status.textContent = "This link page couldn’t load. Please try again later.";
    console.error("OrcaLink could not load its configuration.", error);
  }
}

start();
