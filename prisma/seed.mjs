import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'dev.db');
const db = new Database(dbPath);

const hubs = [
  { slug: 'hub-general', name: 'General', description: 'General discussion and announcements', emoji: '💬' },
  { slug: 'hub-rd', name: 'R&D', description: 'Research and development projects', emoji: '🔬' },
  { slug: 'hub-ops', name: 'Operations', description: 'Day-to-day operations and logistics', emoji: '⚙️' },
  { slug: 'hub-engineering', name: 'Engineering', description: 'Technical implementation and architecture', emoji: '🛠️' },
  { slug: 'hub-legal-ip', name: 'Legal & IP', description: 'Intellectual property and legal matters', emoji: '⚖️' },
  { slug: 'hub-governance', name: 'Governance', description: 'Platform governance and decision-making', emoji: '🏛️' },
  { slug: 'hub-sales', name: 'Sales & Licensing', description: 'Commercialization and licensing', emoji: '💰' },
  { slug: 'hub-security', name: 'Security', description: 'Security audits, incidents, and policies', emoji: '🔒' },
];

const insert = db.prepare(`
  INSERT OR IGNORE INTO Hub (id, slug, name, description, emoji, createdAt, updatedAt)
  VALUES (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6))), ?, ?, ?, ?, datetime('now'), datetime('now'))
`);

for (const hub of hubs) {
  insert.run(hub.slug, hub.name, hub.description, hub.emoji);
  console.log(`  ✓ Hub: ${hub.name}`);
}

console.log(`\nSeeded ${hubs.length} hubs!`);
db.close();
