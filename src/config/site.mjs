export const SITE = {
  title: "PilihSMA",
  description:
    "Data hasil SNBP dari SMA di Indonesia (2024-2026), dikumpulkan dari pengumuman resmi tiap sekolah — dimulai dari Kota Bandung.",
  defaultLanguage: "id",
  url: "https://pilihsma.ryanalvita.com",
  base: "/",
  author: "PilihSMA",
  ogImage: "/og-image.png", // Add this image to your public folder
  // Web3Forms: Get your free access key from https://web3forms.com
  // Leave empty to disable the "Kirim Data" form submission
  web3formsAccessKey: "9d223da2-93a6-467e-940a-acc4f208781a",
  // Set to true to show "Kontribusi Data" links/nav (Header, homepage CTAs)
  // and make the /submit page reachable from the rest of the site. The
  // /submit page itself always exists; this just controls whether anything
  // points to it. Flip back to true whenever the feature is ready to launch.
  submitEnabled: true,
};

// `SITE.base` is fed straight into `astro.config.mjs`'s `base` option, which needs the
// literal "/" at the root (not ""). Everywhere else in the codebase, links/canonical URLs
// are built as `${SITE.pathPrefix}/about` etc. — with `base: "/"`, using `SITE.base` there
// would produce "//about", which browsers parse as a protocol-relative URL (host "about"),
// not a path. `pathPrefix` is the same value with any trailing slash stripped, so
// concatenating it with a path that already starts with "/" never doubles up. Use
// `SITE.pathPrefix` (not `SITE.base`) for building any href/canonicalURL/comparison string.
SITE.pathPrefix = SITE.base.replace(/\/$/, "");
