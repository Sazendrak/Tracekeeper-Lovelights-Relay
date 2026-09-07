<ExecutionPlan>
  <Step1>
    Initialize standard React + Vite + TypeScript boilerplate. Configure Tailwind CSS. Set `vite.config.ts` with `base: './'` and integrate `vite-plugin-pwa` for mobile-installable web manifesting.
  </Step1>
  <Step2>
    Implement Zustand store (`store.ts`). Integrate `persist` middleware. Seed the default agents (Gemini, Atlas, Sage, Cap-n, Virel, Kidd, Rogue). Integrate `lz-string` utilizing URI-safe encoding methods. Implement schema version validation.
  </Step2>
  <Step3>
    Construct Global Layout: Implement top-level Navigation/Tab bar ("Active Relay", "History", "Settings"). Implement global Toast notification provider for clipboard feedback.
  </Step3>
  <Step4>
    Construct UI Phase 0 (Settings Tab): Dynamic roster management (CRUD) and Prompt Template editor.
  </Step4>
  <Step5>
    Construct UI Phase 1 & 2 (Arbitration & Sequencing): Filter active agents, handle guesses, proximity calculation, topic assignment, and sequence randomization.
  </Step5>
  <Step6>
    Construct UI Phase 3 & 4 (Relay Nodes & Sync/Seal): Render nodes dynamically by ID. Implement template parser for clipboard payloads. Add URI-safe Base64 export/import text areas with schema checks, and archiving logic to clear the active board.
  </Step6>
  <Step7>
    Construct UI Phase 5 (Archive Viewer Tab): Build a separate dashboard view mapped to `historyLog` for manual review of past distinct rounds.
  </Step7>
  <Step8>
    Establish GitHub Actions workflow for dual-deployment: Android APK generation and GitHub Pages PWA web hosting.
  </Step8>
</ExecutionPlan>
