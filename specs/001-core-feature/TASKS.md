# TASK LEDGER

- [DONE] Initialize React/Vite/TS project environment.
- [DONE] Configure `vite.config.ts` with `base: './'` for relative asset pathing and configure `vite-plugin-pwa` with a basic manifest for installability.
- [DONE] Install dependencies: `zustand`, `lz-string`, `lucide-react`, `tailwindcss`, `vite-plugin-pwa`, `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`.
- [DONE] Configure Tailwind CSS (tailwind.config.js, index.css).
- [ ] Create Zustand store (`src/store.ts`) adhering to the `<DataSchema>`.
- [ ] Seed default agents using `crypto.randomUUID()`.
- [ ] Implement LZ-String state serialization using `compressToEncodedURIComponent`.
- [ ] Build Global Layout Component (Tabbed navigation for Active Relay, History, Settings).
- [ ] Build Global Toast Notification system for clipboard feedback.
- [ ] Build Configuration Component (Agent CRUD & Prompt Template Editor).
- [ ] Build Arbitration Component (Dynamic active-agent filtering & proximity calc).
- [ ] Build Sequencing Component (Topic input & ID-based randomizer).
- [ ] Build Relay Node Component (Template parser for clipboard payloads + copy actions).
- [ ] Build Sync & Seal Component (URI-safe Base64 UI & archive logic).
- [ ] Build Archive Viewer Component (Reverse-chronological mapped cards and delete logic).
- [ ] Assemble components into main `App.tsx` layout.
- [ ] Initialize Capacitor (`npx cap init` and `npx cap add android`).
- [ ] Write GitHub Actions CI/CD workflow to `.github/workflows/capacitor-build.yml` including GH Pages deployment.
