module.exports.validateOrder = function validateOrder(order) {
    if (!order || !order.type || !order.price || 
      !order.size || !order.sauces || !order.dressing) {
      return `:x: Please fill in required fields: Order, sauces, and dressing.`;
    }

    switch (order.type) {
       case 'Tenders':
        if ((order.size === '2' || order.size === '4') && order.sauces.length > 1) {
          return `:x: With ${order.size} ${order.type} you are only allowed to have 1 sauce.`;
        } else if((order.size === '6' || order.size === '8') && order.sauces.length > 2) {
          return `:x: With ${order.size} ${order.type} you are only allowed to have up to 2 sauces.`;
        }
        break;
       case 'Wings':
        if (order.size === '6' && order.sauces.length > 1) {
          return `:x: With ${order.size} ${order.type} you are only allowed to have 1 sauce.`;
        } else if((order.size === '9' || order.size === '12') && order.sauces.length > 2) {
          return `:x: With ${order.size} ${order.type} you are only allowed to have up to 2 sauces.`;
        }
        break;
       default:
        return `:x: Order type '${order.type}' not recognized.`;
    }
  
    if (order.completed_before) {
      text = `:white_check_mark: Order successfully updated: ${order.size} ${order.type} - ${order.sauces.join(', ')} - ${order.dressing} - ${order.fries || 'No'} fries!`;
      order.complete = true;
    } else {
      text = `:white_check_mark: Order placed: ${order.size} ${order.type} - ${order.sauces.join(', ')} - ${order.dressing} - ${order.fries || 'No'} fries!\nIf you change your mind you can order again to update your current order.`;
      order.complete = true;
      order.completed_before = true;
    }
  
    return text;
};