import { randomBytes, pbkdf2Sync } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const password = process.env.DASHBOARD_PASSWORD;
if (!password || password.length < 8) {
  throw new Error('DASHBOARD_PASSWORD must be set and contain at least 8 characters. Add it as a GitHub Actions secret.');
}

const iterations = 600_000;
const salt = randomBytes(16);
const verifier = pbkdf2Sync(password, salt, iterations, 32, 'sha256');
const out = `// GENERATED FILE. Never commit this file.\nexport const authConfig = ${JSON.stringify({
  iterations,
  salt: salt.toString('base64'),
  verifier: verifier.toString('base64'),
})} as const;\n`;

await fs.mkdir(path.join(root, 'src/config'), { recursive: true });
await fs.writeFile(path.join(root, 'src/config/auth.generated.ts'), out);
console.log('Generated password verifier.');
