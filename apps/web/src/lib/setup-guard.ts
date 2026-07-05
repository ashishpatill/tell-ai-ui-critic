import { NextResponse } from "next/server";
import { isRepoSetupEnabled } from "./repo-root";

export function repoSetupDisabledResponse() {
  return NextResponse.json(
    {
      error:
        "GitHub repo setup is disabled in this deployment. Paste a live URL instead, or run Tell locally for clone-and-run.",
    },
    { status: 503 },
  );
}

export function assertRepoSetupEnabled() {
  if (!isRepoSetupEnabled()) {
    return repoSetupDisabledResponse();
  }
  return null;
}
