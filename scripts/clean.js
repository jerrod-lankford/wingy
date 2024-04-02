import fs from 'fs';
import { closeThread } from '../bot/utils.js';

const THREAD_FILE = 'thread.id';

async function main() {
  if (fs.existsSync(THREAD_FILE)) {
    const slackId = fs.readFileSync(THREAD_FILE, 'utf8');
    await closeThread(slackId);
  }

  return {};
}

await main();
