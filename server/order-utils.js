/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function validateOrder(order) {
  if (!order || !order.type || !order.price
    || !order.item || !order.sauces || !order.dressing) {
    return ':x: Please fill in required fields: Order, sauces, and dressing.';
  }

  const size = order.item.split(' ')[0];
  let text = '';
  switch (order.type) {
    case 'Tenders':
      if ((size === '2' || size === '4') && order.sauces.length > 1) {
        return `:x: With ${size} ${order.type} you are only allowed to have 1 sauce.`;
      }
      if ((size === '6' || size === '8') && order.sauces.length > 2) {
        return `:x: With ${size} ${order.type} you are only allowed to have up to 2 sauces.`;
      }
      break;
    case 'Wings':
      if (size === '6' && order.sauces.length > 1) {
        return `:x: With ${size} ${order.type} you are only allowed to have 1 sauce.`;
      }
      if ((size === '9' || size === '12') && order.sauces.length > 2) {
        return `:x: With ${size} ${order.type} you are only allowed to have up to 2 sauces.`;
      }
      break;
    case 'Specials':
      if (order.item.includes('Madness Meal') && order.sauces.length > 2) {
        return ':x: With the Madness Meal you are only allowed to have up to 2 sauces.';
      }
      break;
    default:
      return `:x: Order type '${order.type}' not recognized.`;
  }

  if (order.completed_before) {
    text = `:white_check_mark: Order successfully updated: ${order.item} - ${order.sauces.join(', ')} - ${order.dressing} - ${order.fries
      || 'No'} community fries!`;
    order.complete = true;
  } else {
    text = `:white_check_mark: Order placed: ${order.item} - ${order.sauces.join(', ')} - ${order.dressing} - ${order.fries
    || 'No'} community fries!\nIf you change your mind you can order again to update your current order.`;
    order.complete = true;
    order.completed_before = true;
  }

  return text;
}

export function validateThread(thread) {
  if (!thread || !thread.active) {
    return ':x: There is no active order. Perhaps you missed the boat?';
  }

  return null;
}

export function getReceiptImage(slackId) {
  return path.join(__dirname, `../${slackId.replace('.', '')}-receipt.png`);
}
