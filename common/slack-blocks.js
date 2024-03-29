const MENU = require('./menu-items');

const ACTIONS = {
  SIZE: "size",
  SAUCES: "sauces",
  DRESSING: "dressing",
  FRIES: "fries",
  ORDER: "order"
};

// Generate options for the dropdowns
function generateOption(name, price, category) {
  const text = price ? `${name} - $${price}` : name;
  let value = price ? `${name}:${price}` : name;
  value = category ? `${category}:${value}` : value;

  return {
    text: {
      type: "plain_text",
      text,
      emoji: true
    },
    value
  }
}

// Generate the main menu options
function generate(items) {
  return Object.entries(items).map(([key, value])=> {
    const item = {
        label: {
          type: "plain_text",
          text: key,
          emoji: true
      }
    };

    if (Array.isArray(value)) {
      item.options = value.map(name => generateOption(name));
    } else {
      item.options = Object.entries(value).map(([name, price]) => generateOption(name, price, key));
    }

    return item;
  });
};

module.exports.ACTIONS = ACTIONS;

module.exports.slackBlocks = [
  {
    type: "image",
    block_id: "zQvI",
    image_url: "https://imgur.com/M1xcNUm.png",
    alt_text: "image1",
    title: {
      type: "plain_text",
      text: "Wings Over",
      emoji: true
    }
  },
  {
    type: "section",
    block_id: "f3Rzn",
    text: {
      type: "mrkdwn",
      text: "Fill out your order below. <https://www.wingsover.com/menu|Menu>",
      verbatim: false
    }
  },
  {
    type: "divider",
    block_id: "fmYG"
  },
  {
    type: "section",
    block_id: "cVjEL",
    text: {
      type: "mrkdwn",
      text: "What would you like?",
      verbatim: false
    },
    accessory: {
      type: "static_select",
      action_id: ACTIONS.SIZE,
      placeholder: {
        type: "plain_text",
        text: "Select an item",
        emoji: true
      },
      option_groups: generate(MENU.MAINS)
    }
  },
  {
    type: "section",
    block_id: "gl/M",
    text: {
      type: "mrkdwn",
      text: "Choose sauces",
      verbatim: false
    },
    accessory: {
      type: "multi_static_select",
      action_id: ACTIONS.SAUCES,
      placeholder: {
        type: "plain_text",
        text: "Select Sauces",
        emoji: true
      },
      option_groups: generate(MENU.SAUCES)
    }
  },
  {
    type: "section",
    block_id: "IHcw",
    text: {
      type: "mrkdwn",
      text: "Dressing",
      verbatim: false
    },
    accessory: {
      type: "static_select",
      action_id: ACTIONS.DRESSING,
      placeholder: {
        type: "plain_text",
        text: "Choose a dressing",
        emoji: true
      },
      options: MENU.DRESSINGS.map(name => generateOption(name))
    }
  },
  {
    type: "section",
    block_id: "46a7",
    text: {
      type: "mrkdwn",
      text: "Community Fries",
      verbatim: false
    },
    accessory: {
      type: "static_select",
      action_id: ACTIONS.FRIES,
      placeholder: {
        type: "plain_text",
        text: "Choose an option",
        emoji: true
      },
      options: [
        {
          text: {
            type: "plain_text",
            text: "Yes",
            emoji: true
          },
          value: "Yes"
        },
        {
          text: {
            type: "plain_text",
            text: "No",
            emoji: true
          },
          value: "No"
        }
      ]
    }
  },
  {
    type: "section",
    block_id: "jUwwP",
    text: {
      type: "mrkdwn",
      text: "Finalize your order",
      verbatim: false
    },
    accessory: {
      type: "button",
      action_id: ACTIONS.ORDER,
      text: {
        type: "plain_text",
        text: "Order",
        emoji: true
      },
      value: "Order",
      style: "primary",
      confirm: {
        title: {
          type: "plain_text",
          text: "Confirm Order"
        },
        text: {
          type: "mrkdwn",
          text: "Does everything look good?"
        },
        confirm: {
          type: "plain_text",
          text: "Yes"
        },
        deny: {
          type: "plain_text",
          text: "No"
        }
      }
    }
  }
];
