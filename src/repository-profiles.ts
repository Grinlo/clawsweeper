export type RepositoryItemKind = "issue" | "pull_request";
export type RepositoryCloseReason =
  | "implemented_on_main"
  | "cannot_reproduce"
  | "clawhub"
  | "duplicate_or_superseded"
  | "not_actionable_in_repo"
  | "incoherent"
  | "stale_insufficient_info"
  | "none";

export interface RepositoryProfile {
  targetRepo: string;
  slug: string;
  displayName: string;
  checkoutDir: string;
  docsUrl?: string;
  communityUrl?: string;
  promptNote: string;
  applyCloseRules: Partial<Record<RepositoryItemKind, readonly RepositoryCloseReason[]>>;
}

const STANDARD_CLOSE_REASONS: readonly RepositoryCloseReason[] = [
  "implemented_on_main",
  "cannot_reproduce",
  "duplicate_or_superseded",
  "not_actionable_in_repo",
  "incoherent",
  "stale_insufficient_info",
];

export const DEFAULT_TARGET_REPO = "Grinlo/grinlo-website";

export const REPOSITORY_PROFILES: readonly RepositoryProfile[] = [
  {
    targetRepo: "Grinlo/grinlo-website",
    slug: "grinlo-grinlo-website",
    displayName: "Grinlo Website",
    checkoutDir: "grinlo-website",
    docsUrl: "https://grinlo.com",
    promptNote:
      "This is the main Grinlo.com website (Next.js, TypeScript). It serves NYC Central Park pedicab tour bookings. Review issues and PRs conservatively. Close proposals may use the normal stale/duplicate/not-in-repo/implemented-on-main policy when evidence is strong. Be careful with any UI or pricing changes.",
    applyCloseRules: {
      issue: STANDARD_CLOSE_REASONS,
      pull_request: STANDARD_CLOSE_REASONS.filter((r) => r !== "stale_insufficient_info"),
    },
  },
  {
    targetRepo: "Grinlo/tripuae-claude-agent",
    slug: "grinlo-tripuae-claude-agent",
    displayName: "Marina AI Agent",
    checkoutDir: "tripuae-claude-agent",
    promptNote:
      "This is the Marina AI sales agent for TripUAE (Python, Telegram bot). Review issues and PRs conservatively. Any changes to the agent prompt, sales logic, or pricing integrations require extra scrutiny. Only propose auto-close for clearly implemented or duplicate items.",
    applyCloseRules: {
      issue: ["implemented_on_main", "duplicate_or_superseded", "not_actionable_in_repo", "incoherent"],
      pull_request: ["implemented_on_main", "duplicate_or_superseded"],
    },
  },
  {
    targetRepo: "Grinlo/team-command-center",
    slug: "grinlo-team-command-center",
    displayName: "Team Command Center",
    checkoutDir: "team-command-center",
    promptNote:
      "This is the TCC (Team Command Center) — internal task management system for the Grinlo/TripUAE bot fleet. Review issues and PRs conservatively. Only propose auto-close for clearly implemented or duplicate items. Never close issues that are about bot behavior or task lifecycle.",
    applyCloseRules: {
      issue: ["implemented_on_main", "duplicate_or_superseded", "not_actionable_in_repo", "incoherent"],
      pull_request: ["implemented_on_main", "duplicate_or_superseded"],
    },
  },
  {
    targetRepo: "Grinlo/clawsweeper",
    slug: "grinlo-clawsweeper",
    displayName: "ClawSweeper (Grinlo fork)",
    checkoutDir: "clawsweeper",
    promptNote:
      "This is the Grinlo fork of ClawSweeper. Review bot automation, workflow, and configuration changes conservatively. Only propose auto-close for pull requests that are certainly implemented on main; keep issues open for maintainer triage.",
    applyCloseRules: {
      issue: [],
      pull_request: ["implemented_on_main"],
    },
  },
];

export function repositoryProfileFor(targetRepo: string): RepositoryProfile {
  const normalized = normalizeRepo(targetRepo);
  const profile = REPOSITORY_PROFILES.find(
    (candidate) => normalizeRepo(candidate.targetRepo) === normalized,
  );
  if (!profile) {
    throw new Error(
      `Unsupported target repo: ${targetRepo}. Known repos: ${REPOSITORY_PROFILES.map((candidate) => candidate.targetRepo).join(", ")}`,
    );
  }
  return profile;
}

export function repositoryProfileForSlug(slug: string): RepositoryProfile | undefined {
  return REPOSITORY_PROFILES.find((candidate) => candidate.slug === slug);
}

export function normalizeRepo(targetRepo: string): string {
  return targetRepo.trim().toLowerCase();
}

export function isAutoCloseAllowed(
  profile: RepositoryProfile,
  kind: RepositoryItemKind,
  reason: RepositoryCloseReason,
): boolean {
  const rules = profile.applyCloseRules[kind];
  if (!rules) return false;
  return rules.includes(reason);
}
