export const SITE = {
  title: "PilihSMA",
  description:
    "Data hasil SNBP dari SMA di Indonesia (2024-2026), dikumpulkan dari pengumuman resmi tiap sekolah — dimulai dari Kota Bandung.",
  defaultLanguage: "id",
  url: "https://ryanalvita.com",
  // Temporary: no dedicated custom domain configured for this repo's GitHub
  // Pages site, so it's served as a project page under the account's apex
  // domain instead - https://ryanalvita.com/pilih-sma/. Revert to a bare
  // "/" base (and set url to the dedicated subdomain) once/if
  // pilihsma.ryanalvita.com is set up as this repo's own custom domain.
  base: "/pilih-sma",
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
