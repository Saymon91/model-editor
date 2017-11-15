const model = {
  "parameters": {
    "parameter-field-#1": {
      "id"    : "parameter-field-#1",
      "name"  : "parking",
      "label" : "Test",
      "custom": false,
      "type"  : "DC",
      "invert": false
    },
    "parameter-field-#2": {
      "id"    : "parameter-field-#2",
      "name"  : "guard",
      "label" : "Test1",
      "custom": true,
      "type"  : "DC",
      "invert": true
    },
    "parameter-field-#3": {
      "id"         : "parameter-field-#3",
      "name"       : "guard",
      "label"      : "Test1",
      "custom"     : true,
      "type"       : "ADC"
    },
    "parameter-field-#4": {
      "id"         : "parameter-field-#4",
      "name"       : "guard-decode",
      "label"      : "Test1-decode",
      "custom"     : true,
      "type"       : "VADC",
      "source"     : "parameter-field-#3",
      "table": {
        "infra" : [
          "x",
          "return x;"
        ],
        "ultra" : [
          "x",
          "return x;"
        ],
        "except": [
          "x",
          "return x;"
        ],
        "values": [
          {
            "from": 10,
            "to"  : 20,
            "fx"  : "return 2 * x;"
          },
          {
            "from": 20,
            "to"  : 40,
            "fx"  : "return 1.5 * x;"
          }
        ]
      }
    },
  },
  "commands"  : {
    "send-command-to-device": {
      "base"     : null,
      "arguments": {
        "device-id": {
          "type" : "text",
          "value": undefined
        },
        "method"   : {
          "type" : "text",
          "value": undefined
        },
        "arguments": {
          "type" : "text",
          "value": undefined
        }
      }
    },
    "toggle-dry-contact": {
      "base"     : null,
      "arguments": {
        "device-id": {
          "type" : "text",
          "value": undefined
        },
        "method"   : {
          "type" : "text",
          "value": "toggle"
        },
        "arguments": {
          "type" : "object",
          "value": {
            "address": {
              "type" : "text",
              "value": undefined
            },
            "state"  : {
              "type" : "text",
              "value": undefined
            }
          }
        }
      }
    },
    "toggle-dry-contact#1": {
      "base"     : null,
      "arguments": {
        "method"   : {
          "type" : "text",
          "value": "toggle"
        },
        "arguments": {
          "type" : "object",
          "value": {
            "address": {
              "type" : "text",
              "value": "1"
            },
            "state"  : {
              "type" : "text",
              "value": undefined
            }
          }
        }
      }
    },
    "toggle-on-dry-contact#1": {
      "base"     : null,
      "arguments": {
        "method"   : {
          "type" : "text",
          "value": "toggle"
        },
        "arguments": {
          "type" : "object",
          "value": {
            "address": {
              "type" : "text",
              "value": "1"
            },
            "state"  : {
              "type" : "text",
              "value": "on"
            }
          }
        }
      }
    },
    "toggle-off-dry-contact#1": {
      "base"     : null,
      "arguments": {
        "method"   : {
          "type" : "text",
          "value": "toggle"
        },
        "arguments": {
          "type" : "object",
          "value": {
            "address": {
              "type" : "text",
              "value": "1"
            },
            "state"  : {
              "type" : "text",
              "value": "on"
            }
          }
        }
      }
    },
  },
  "events"    : {
    "received-data": {
      "base"      : null,
      "priority"  : Infinity,
      "conditions": [],
      "watch"     : []
    }
  }
};

const mixins = {
  timers    : {
    commands: {},
    events  : {},
  },
  schedulers: {
    commands: {},
    events  : {},
  }
};