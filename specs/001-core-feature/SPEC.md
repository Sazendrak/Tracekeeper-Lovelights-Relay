<Specification>
  <Overview>
    A local-first React + Vite + Capacitor Single Page Application (SPA) for managing a multi-agent AI relay topology. Features include a dynamic agent roster, automated turn sequencing, customizable prompt templating, cross-device state synchronization via Base64 LZ-String compression, and a modular archive viewer for discrete round logging.
  </Overview>

  <Architecture>
    <Stack>
      - Frontend: React 18, Vite, TypeScript
      - State Management: Zustand (with `persist` middleware to `localStorage`)
      - Styling: Tailwind CSS, lucide-react (Icons)
      - Data Serialization: `lz-string` (Strictly using `compressToEncodedURIComponent` for messenger-safe payloads)
      - Mobile Build (Primary): Capacitor CLI (Android target)
      - Web Build (Secondary): GitHub Pages deployment with `vite-plugin-pwa` for native home-screen installation.
    </Stack>
    <Layout>
      - The UI MUST utilize a top-level Tab or Navigation bar to strictly separate views: "Active Relay", "History Archive", and "Settings".
      - All clipboard copy actions MUST trigger a temporary UI Toast notification for positive user feedback.
    </Layout>
  </Architecture>

  <DataSchema>
    <StateTopology>
      ```typescript
      interface Agent {
        id: string; // generated via crypto.randomUUID()
        name: string;
        isActive: boolean; // toggle inclusion for current round
      }

      interface RelayRound {
        id: string; // unique identifier for the archive
        timestamp: number; // UNIX epoch for sorting
        schemaVersion: string; // "1.0", prevents import crashes
        targetNumber: number | null; 
        agentGuesses: Record<string, number>; // Maps Agent.id to guess
        starterAgentId: string | null;
        topic: string;
        turnOrder: string[]; // Array of Agent.ids
        responses: Record<string, string>; // Maps Agent.id to their text response
        isSealed: boolean;
      }

      interface AppState {
        agents: Agent[]; // Seeded initially with Gemini, Atlas, Sage, Cap-n, Virel, Kidd, Rogue
        promptTemplate: string; // e.g., "Topic: {topic}\n\nPrevious: {history}\n\n{agent}, your turn."
        activeRound: RelayRound | null;
        historyLog: RelayRound[]; // Array of discrete, separated rounds
      }
      ```
    </StateTopology>
  </DataSchema>

  <ExecutionPhases>
    <Phase name="Configuration (Settings Tab)">
      1. Roster UI: View, Add, Edit, or Delete agents. Toggle `isActive` for upcoming rounds.
      2. Template UI: Textarea to define the global prompt injection template using `{topic}`, `{history}`, and `{agent_name}`.
    </Phase>
    <Phase name="Arbitration (Active Relay Tab)">
      1. UI renders numeric inputs ONLY for agents marked `isActive`.
      2. UI provides `[Generate Target Number]` (1-100).
      3. System calculates absolute proximity to designate `starterAgentId` (with manual override dropdown).
    </Phase>
    <Phase name="Sequencing (Active Relay Tab)">
      1. UI accepts "Topic/Question" string from the starter.
      2. UI provides `[Generate Order]` button. Randomizes remaining `isActive` agents into `turnOrder`.
    </Phase>
    <Phase name="RelayNodes (Active Relay Tab)">
      1. UI renders textareas sequentially based on `turnOrder`.
      2. Action: `[Copy Node]` - Copies only that specific agent's response (Triggers Toast).
      3. Action: `[Copy Relay Payload]` - Compiles clipboard payload by passing current state through the user-defined `promptTemplate` (Triggers Toast).
    </Phase>
    <Phase name="SyncAndSeal (Active Relay Tab)">
      1. Sync Protocol: `[Export State]` compresses `activeRound` using `lzString.compressToEncodedURIComponent` for clipboard. `[Import State]` decompresses via `decompressFromEncodedURIComponent` and hydrates local state, strictly merging missing responses.
      2. Seal: Injects `id` and `timestamp`, archives `activeRound` to `historyLog`, and sets `activeRound` to null (resets board).
    </Phase>
    <Phase name="ArchiveViewer (History Tab)">
      1. UI renders a dedicated "History Archive" screen.
      2. Renders `historyLog` as a reverse-chronological list of distinct, clickable cards displaying the `timestamp` and `topic`.
      3. Clicking a card expands it to display full standalone RelayRound data for manual review.
      4. Action: `[Delete Record]` - removes specific round from persistent storage.
    </Phase>
  </ExecutionPhases>
</Specification>
