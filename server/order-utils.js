module.exports.validateOrder = function validateOrder(order) {
    if (!order || !order.type || !order.price || 
      !order.item || !order.sauces || !order.dressing) {
      return `:x: Please fill in required fields: Order, sauces, and dressing.`;
    }

    const size = order.item.split(" ")[0];
    switch (order.type) {
       case 'Tenders':
        if ((size === '2' || size === '4') && order.sauces.length > 1) {
          return `:x: With ${size} ${order.type} you are only allowed to have 1 sauce.`;
        } else if((size === '6' || size === '8') && order.sauces.length > 2) {
          return `:x: With ${size} ${order.type} you are only allowed to have up to 2 sauces.`;
        }
        break;
       case 'Wings':
        if (size === '6' && order.sauces.length > 1) {
          return `:x: With ${size} ${order.type} you are only allowed to have 1 sauce.`;
        } else if((size === '9' || size === '12') && order.sauces.length > 2) {
          return `:x: With ${size} ${order.type} you are only allowed to have up to 2 sauces.`;
        }
        break;
       default:
        return `:x: Order type '${order.type}' not recognized.`;
    }
  
    if (order.completed_before) {
      text = `:white_check_mark: Order successfully updated: ${order.item} - ${order.sauces.join(', ')} - ${order.dressing} - ${order.fries || 'No'} fries!`;
      order.complete = true;
    } else {
      text = `:white_check_mark: Order placed: ${order.item} - ${order.sauces.join(', ')} - ${order.dressing} - ${order.fries || 'No'} fries!\nIf you change your mind you can order again to update your current order.`;
      order.complete = true;
      order.completed_before = true;
    }
  
    return text;
};

module.exports.validateThread = function(thread) {
  if (!thread || !thread.active) {
    return  ':x: There is no active order. Perhaps you missed the boat?';
  }

  return null;
}

module.exports.getReceiptImage = function(thread) {
  return path.join(__dirname, `../${thread.replace('.','')}-receipt.png`);
}