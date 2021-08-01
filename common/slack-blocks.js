const ACTIONS = {
  SIZE: "size",
  SAUCES: "sauces",
  DRESSING: "dressing",
  FRIES: "fries",
  ORDER: "order"
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
      text: "Wing Size",
      verbatim: false
    },
    accessory: {
      type: "static_select",
      action_id: ACTIONS.SIZE,
      placeholder: {
        type: "plain_text",
        text: "Select a size",
        emoji: true
      },
      option_groups: [
        {
          label: {
            type: "plain_text",
            text: "Hand Breaded Tendies",
            emoji: true
          },
          options: [
            {
              text: {
                type: "plain_text",
                text: "2 Tenders - $4.99",
                emoji: true
              },
              value: "Tenders:2:4.99"
            },
            {
              text: {
                type: "plain_text",
                text: "4 Tenders - $7.99",
                emoji: true
              },
              value: "Tenders:4:7.99"
            },
            {
              text: {
                type: "plain_text",
                text: "6 Tenders - $11.49",
                emoji: true
              },
              value: "Tenders:6:11.49"
            },
            {
              text: {
                type: "plain_text",
                text: "8 Tenders - $14.49",
                emoji: true
              },
              value: "Tenders:8:14.49"
            }
          ]
        },
        {
          label: {
            type: "plain_text",
            text: "Jumbo Wings",
            emoji: true
          },
          options: [
            {
              text: {
                type: "plain_text",
                text: "6 Wings - $9.49",
                emoji: true
              },
              value: "Wings:6:9.49"
            },
            {
              text: {
                type: "plain_text",
                text: "9 Wings - $14.49",
                emoji: true
              },
              value: "Wings:9:14.49"
            },
            {
              text: {
                type: "plain_text",
                text: "12 Wings - $17.49",
                emoji: true
              },
              value: "Wings:12:17.49"
            }
          ]
        }
      ]
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
      option_groups: [
        {
          label: {
            type: "plain_text",
            text: "Dry",
            emoji: true
          },
          options: [
            {
              text: {
                type: "plain_text",
                text: "West Texas Mesquite",
                emoji: true
              },
              value: "West Texas Mesquite"
            },
            {
              text: {
                type: "plain_text",
                text: "Cajun",
                emoji: true
              },
              value: "Cajun"
            },
            {
              text: {
                type: "plain_text",
                text: "7 Pepper",
                emoji: true
              },
              value: "7 Pepper"
            },
            {
              text: {
                type: "plain_text",
                text: "Garlic Parm ⭐️",
                emoji: true
              },
              value: "Garlic Parm ⭐️"
            },
            {
              text: {
                type: "plain_text",
                text: "Lemon Pepper ⭐️",
                emoji: true
              },
              value: "Lemon Pepper ⭐️"
            }
          ]
        },
        {
          label: {
            type: "plain_text",
            text: "Buffalo",
            emoji: true
          },
          options: [
            {
              text: {
                type: "plain_text",
                text: "Mild 🌶️",
                emoji: true
              },
              value: "Mild 🌶️"
            },
            {
              text: {
                type: "plain_text",
                text: "Medium 🌶️🌶️ ⭐",
                emoji: true
              },
              value: "Medium 🌶️🌶️ ⭐"
            },
            {
              text: {
                type: "plain_text",
                text: "Hot 🌶️🌶️🌶️",
                emoji: true
              },
              value: "Hot 🌶️🌶️🌶️"
            },
            {
              text: {
                type: "plain_text",
                text: "Fire 🌶️🌶️🌶️🌶️🌶️",
                emoji: true
              },
              value: "Fire 🌶️🌶️🌶️🌶️🌶️"
            }
          ]
        },
        {
          label: {
            type: "plain_text",
            text: "BBQ",
            emoji: true
          },
          options: [
            {
              text: {
                type: "plain_text",
                text: "Cajun BBQ",
                emoji: true
              },
              value: "Cajun BBQ"
            },
            {
              text: {
                type: "plain_text",
                text: "Citrus Chipotle 🌶",
                emoji: true
              },
              value: "Citrus Chipotle 🌶"
            },
            {
              text: {
                type: "plain_text",
                text: "Golden BBQ",
                emoji: true
              },
              value: "Golden BBQ"
            },
            {
              text: {
                type: "plain_text",
                text: "Honey BBQ ⭐️",
                emoji: true
              },
              value: "Honey BBQ ⭐️"
            },
            {
              text: {
                type: "plain_text",
                text: "Kickin' BBQ 🌶",
                emoji: true
              },
              value: "Kickin' BBQ 🌶"
            }
          ]
        },
        {
          label: {
            type: "plain_text",
            text: "Teriyaki",
            emoji: true
          },
          options: [
            {
              text: {
                type: "plain_text",
                text: "Traditional Teriyaki",
                emoji: true
              },
              value: "Traditional Teriyaki"
            },
            {
              text: {
                type: "plain_text",
                text: "Cajun Teriyaki",
                emoji: true
              },
              value: "Cajun Teriyaki"
            },
            {
              text: {
                type: "plain_text",
                text: "Spicy Teriyaki 🌶",
                emoji: true
              },
              value: "Spicy Teriyaki 🌶"
            }
          ]
        },
        {
          label: {
            type: "plain_text",
            text: "Savory",
            emoji: true
          },
          options: [
            {
              text: {
                type: "plain_text",
                text: "Honey Mustard ⭐️",
                emoji: true
              },
              value: "Honey Mustard ⭐️"
            },
            {
              text: {
                type: "plain_text",
                text: "Hot Garlic 🌶",
                emoji: true
              },
              value: "Hot Garlic 🌶"
            },
            {
              text: {
                type: "plain_text",
                text: "Hot Lemon Pepper 🌶",
                emoji: true
              },
              value: "Hot Lemon Pepper 🌶"
            },
            {
              text: {
                type: "plain_text",
                text: "Jamaican Jerk 🌶",
                emoji: true
              },
              value: "Jamaican Jerk 🌶"
            },
            {
              text: {
                type: "plain_text",
                text: "Mango Habanero 🌶",
                emoji: true
              },
              value: "Mango Habanero 🌶"
            },
            {
              text: {
                type: "plain_text",
                text: "Sweet Chili 🌶",
                emoji: true
              },
              value: "Sweet Chili 🌶"
            },
            {
              text: {
                type: "plain_text",
                text: "Sweet Korean Fire 🌶",
                emoji: true
              },
              value: "Sweet Korean Fire 🌶"
            }
          ]
        }
      ]
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
      options: [
        {
          text: {
            type: "plain_text",
            text: "Ranch",
            emoji: true
          },
          value: "Ranch"
        },
        {
          text: {
            type: "plain_text",
            text: "Bleu Cheese",
            emoji: true
          },
          value: "Blue Cheese"
        },
        {
          text: {
            type: "plain_text",
            text: "No Dressing",
            emoji: true
          },
          value: "No Dressing"
        }
      ]
    }
  },
  {
    type: "section",
    block_id: "46a7",
    text: {
      type: "mrkdwn",
      text: "Fries",
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
