import fetch from 'node-fetch';
import FormData from 'form-data';
import path from 'path';
import fs from 'fs';
import config from './configuration.json' assert { type: "json" };
import { fileURLToPath } from 'url';

const BASE_URL = config.baseUrl;
const HEALTH_URL = `${BASE_URL}/health`;
const THREAD_URL = `${BASE_URL}/api/threads`;
const ORDER_URL = `${BASE_URL}/api/threads/:thread/orders`;
const POST_RECEIPT_URL = `${BASE_URL}/api/threads/:thread/receipt`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const THREAD_FILE = path.join(__dirname, '../thread.id');

async function jsonAction(url, body, method = 'POST') {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (response.status !== 200) {
    throw new Error(`Error making xhr to ${url}. Status: ${response.statusText}`);
  }
}

// Fry calculation, 2 people to a large, 1 gets a small
export function fryCalc(numPeople) {
  const large = Math.floor(numPeople / 2);
  const small = numPeople % 2;

  return {
    large,
    small
  };
};

export async function getOrders(thread_ts) {
  const url = ORDER_URL.replace(':thread', thread_ts);
  const response = await fetch(url);
  if (response.data) {
    return response.data;
  } else {
    throw new Error('Error making xhr to get orders.');
  }
};

export async function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function wakeUp() {
  const response = await fetch(HEALTH_URL);
  if (response.status !== 200) {
    throw new Error(`Error waking up dyno: ${response.status}`);
  }
  return response;
};

export async function getCurrentThread() {
  if (fs.existsSync(THREAD_FILE)) {
    return fs.readFileSync(THREAD_FILE, 'utf8');
  }
};

export async function createNewThread(thread_ts) {
  fs.writeFileSync(THREAD_FILE, thread_ts);
  await jsonAction(THREAD_URL, { thread: thread_ts });
}

export async function clearThread(thread) {
  fs.unlinkSync(THREAD_FILE);
  await jsonAction(`${THREAD_URL}/${thread}`, {active: false}, 'PATCH');
};

export async function uploadImage(thread) {
  const form = new FormData();
  form.append('file', fs.createReadStream('../receipt.png'));

  const url = POST_RECEIPT_URL.replace(':thread', thread);
  await fetch(url, {
    method: 'POST',
    headers: {
      ...form.getHeaders()
    },
    body: form
  });
  return `${url}.png`;
}
