# OrcaLink

OrcaLink makes a link page out of a JSON file. I wanted to make a LinkTree alternative that I can manage links from GitHub repo, so here it is, OrcaLink.

## Get started

1. Fork this repo.
2. Open [`orcalink.json`](./orcalink.json) and change to your name and links. The bio, avatar, and cover are optional.
3. Go to **Settings → Pages**, choose **Deploy from a branch**, and select your branch and `/(root)`.

If you already have a static host, serve these files there. You can also keep the JSON in a separate public repo. Put its **Raw** URL in the `orcalink-config` meta tag in `index.html`.

## Add your own entry type

Register a renderer in `app.js` and use its name as the entry's `type` in the JSON.

See [LICENSE](./LICENSE).

*AI might be used in this repo.*
