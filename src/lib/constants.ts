export const POST_TYPES = [
  "RFC",
  "RFP",
  "EXPERIMENT",
  "MILESTONE",
  "ADR",
  "POSTMORTEM",
  "COMMERCIALIZATION",
] as const;

export type PostType = (typeof POST_TYPES)[number];

export const INTENTS = [
  "propose",
  "request",
  "report",
  "decide",
  "analyze",
] as const;

export type Intent = (typeof INTENTS)[number];

export const PROPOSAL_CATEGORIES = [
  "feature",
  "bugfix",
  "config",
  "architecture",
  "process",
] as const;

export const APPROVAL_DECISIONS = ["approve", "reject", "abstain"] as const;

export const DEFAULT_HUBS = [
  { slug: "hub-general", name: "General", description: "General discussion and announcements", emoji: "💬" },
  { slug: "hub-rd", name: "R&D", description: "Research and development projects", emoji: "🔬" },
  { slug: "hub-ops", name: "Operations", description: "Day-to-day operations and logistics", emoji: "⚙️" },
  { slug: "hub-engineering", name: "Engineering", description: "Technical implementation and architecture", emoji: "🛠️" },
  { slug: "hub-legal-ip", name: "Legal & IP", description: "Intellectual property and legal matters", emoji: "⚖️" },
  { slug: "hub-governance", name: "Governance", description: "Platform governance and decision-making", emoji: "🏛️" },
  { slug: "hub-sales", name: "Sales & Licensing", description: "Commercialization and licensing", emoji: "💰" },
  { slug: "hub-security", name: "Security", description: "Security audits, incidents, and policies", emoji: "🔒" },
];
