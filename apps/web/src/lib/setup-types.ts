// Types shared between the server-side repo runner and the client UI.
// Kept free of any Node imports so the client can import it safely.

export type SetupState =
  | "cloning"
  | "installing"
  | "detecting"
  | "starting"
  | "waiting"
  | "ready"
  | "needs-manual"
  | "error";

export interface DetectedPlan {
  packageManager: string;
  installCmd: string;
  runCmd: string | null;
  scriptName: string | null;
  appDir: string;
  framework: string | null;
  readmeInstructions: string[];
  guessedPort: number | null;
}

export interface SetupJob {
  id: string;
  repoUrl: string;
  repoLabel: string;
  state: SetupState;
  step: string;
  logs: string[];
  url: string | null;
  detected: DetectedPlan | null;
  needsManual: boolean;
  error: string | null;
  createdAt: number;
  updatedAt: number;
}

export const SETUP_ACTIVE_STATES: SetupState[] = ["cloning", "installing", "detecting", "starting", "waiting"];
