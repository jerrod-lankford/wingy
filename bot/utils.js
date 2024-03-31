/* eslint-disable no-underscore-dangle */
import FormData from 'form-data';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import config from './configuration.json' with { type: 'json' };

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
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (response.status !== 200) {
    throw new Error(`Error making xhr to ${url}. Status: ${response.statusText}`);
  }
}

export async function getOrders(threadTs) {
  const url = ORDER_URL.replace(':thread', threadTs);
  const response = await fetch(url);
  const data = await response.json();

  if (data) {
    return data;
  }

  throw new Error('Error making xhr to get orders.');
}

export async function timeout(ms) {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

export async function wakeUp() {
  const response = await fetch(HEALTH_URL);
  if (response.status !== 200) {
    throw new Error(`Error waking up dyno: ${response.status}`);
  }
  return response;
}

export async function getCurrentThread() {
  if (fs.existsSync(THREAD_FILE)) {
    return fs.readFileSync(THREAD_FILE, 'utf8');
  }
  return null;
}

export async function createNewThread(threadTs) {
  fs.writeFileSync(THREAD_FILE, threadTs);
  await jsonAction(THREAD_URL, { thread: threadTs });
}

export async function closeThread(thread) {
  fs.unlinkSync(THREAD_FILE);
  await jsonAction(`${THREAD_URL}/${thread}`, { active: false }, 'PATCH');
}

export async function uploadImage(thread) {
  const form = new FormData();
  const receiptUri = path.join(__dirname, '../receipt.png');
  console.log(`uploadImage: ${receiptUri}`);
  form.append('file', fs.createReadStream(receiptUri));

  const url = POST_RECEIPT_URL.replace(':thread', thread);
  await fetch(url, {
    method: 'POST',
    headers: {
      ...form.getHeaders(),
    },
    body: form,
  });
  return `${url}.png`;
}

export async function waitThenClick(page, selector) {
  const element = await page.waitForSelector(selector, { visible: true });
  await element.click();
}

export async function waitThenType(page, selector, text) {
  await page.waitForSelector(selector);
  await page.type(selector, text);
}
