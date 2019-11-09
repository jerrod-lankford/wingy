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
            text: "Boneless",
            emoji: true
          },
          options: [
            {
              text: {
                type: "plain_text",
                text: "DC-3 (1/2 LB) - $6.99",
                emoji: true
              },
              value: "Boneless:DC-3:6.99"
            },
            {
              text: {
                type: "plain_text",
                text: "DC-10 (1LB) - $12.49",
                emoji: true
              },
              value: "Boneless:DC-10:12.49"
            },
            {
              text: {
                type: "plain_text",
                text: "Skymaster (1.5LB) - $17.49",
                emoji: true
              },
              value: "Boneless:Skymaster:17.49"
            },
            {
              text: {
                type: "plain_text",
                text: "Stratocruiser (2LB) - $22.49",
                emoji: true
              },
              value: "Boneless:Stratocruiser:22.49"
            }
          ]
        },
        {
          label: {
            type: "plain_text",
            text: "Bone-in",
            emoji: true
          },
          options: [
            {
              text: {
                type: "plain_text",
                text: "Paper Airplane (Snack) - $5.99",
                emoji: true
              },
              value: "Bone-in:Paper Airplane:5.99"
            },
            {
              text: {
                type: "plain_text",
                text: "Puddle Jumper - $10.99",
                emoji: true
              },
              value: "Bone-in:Puddle Jumper:10.99"
            },
            {
              text: {
                type: "plain_text",
                text: "F-16 - $15.99",
                emoji: true
              },
              value: "Bone-in:F-16:15.99"
            },
            {
              text: {
                type: "plain_text",
                text: "B-1 Bomber - $20.99",
                emoji: true
              },
              value: "Bone-in:B-1 Bomber:20.99"
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
      text: "Choose sauces (Up to 2 except PA and DC-3)",
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
                text: "Cajun Blackened",
                emoji: true
              },
              value: "Cajun Blackened"
            },
            {
              text: {
                type: "plain_text",
                text: "Mustang ranch",
                emoji: true
              },
              value: "Mustang ranch"
            },
            {
              text: {
                type: "plain_text",
                text: "Garlic Parmesan",
                emoji: true
              },
              value: "Garlic Parmesan"
            },
            {
              text: {
                type: "plain_text",
                text: "Lemon Pepper",
                emoji: true
              },
              value: "Lemon Pepper"
            }
          ]
        },
        {
          label: {
            type: "plain_text",
            text: "Wet",
            emoji: true
          },
          options: [
            {
              text: {
                type: "plain_text",
                text: "Wimpy",
                emoji: true
              },
              value: "Wimpy"
            },
            {
              text: {
                type: "plain_text",
                text: "Red Alert",
                emoji: true
              },
              value: "Red Alert"
            },
            {
              text: {
                type: "plain_text",
                text: "AfterBurner",
                emoji: true
              },
              value: "AfterBurner"
            },
            {
              text: {
                type: "plain_text",
                text: "Bar-B-Que",
                emoji: true
              },
              value: "Bar-B-Que"
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
                text: "Cajun BBQ",
                emoji: true
              },
              value: "Cajun BBQ"
            },
            {
              text: {
                type: "plain_text",
                text: "Honey Mustard",
                emoji: true
              },
              value: "Honey Mustard"
            },
            {
              text: {
                type: "plain_text",
                text: "Plain",
                emoji: true
              },
              value: "Plain"
            },
            {
              text: {
                type: "plain_text",
                text: "Hot Garlic",
                emoji: true
              },
              value: "Hot Garlic"
            },
            {
              text: {
                type: "plain_text",
                text: "Spicy Teriyaki",
                emoji: true
              },
              value: "Spicy Teriyaki"
            },
            {
              text: {
                type: "plain_text",
                text: "Citrus Chipotle",
                emoji: true
              },
              value: "Citrus Chipotle"
            },
            {
              text: {
                type: "plain_text",
                text: "Cruisin Altitude",
                emoji: true
              },
              value: "Cruisin Altitude"
            },
            {
              text: {
                type: "plain_text",
                text: "Jet Fuel",
                emoji: true
              },
              value: "Jet Fuel"
            },
            {
              text: {
                type: "plain_text",
                text: "Honey BBQ",
                emoji: true
              },
              value: "Honey BBQ"
            },
            {
              text: {
                type: "plain_text",
                text: "Kickin' BBQ",
                emoji: true
              },
              value: "Kickin' BBQ"
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
                text: "Teriyaki",
                emoji: true
              },
              value: "Teriyaki"
            },
            {
              text: {
                type: "plain_text",
                text: "Jamaican Jerk",
                emoji: true
              },
              value: "Jamaican Jerk"
            },
            {
              text: {
                type: "plain_text",
                text: "Sweet Chili",
                emoji: true
              },
              value: "Sweet Chili"
            },
            {
              text: {
                type: "plain_text",
                text: "Korean Sweet Fire",
                emoji: true
              },
              value: "Korean Sweet Fire"
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
          value: "Bleu Cheese"
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
