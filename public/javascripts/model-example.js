const model = {
  "parameters": {
    "parameter-field-#1": {
      "id"    : "parameter-field-#1",
      "name"  : "parking",
      "label" : "Test",
      "custom": false,
      "type"  : "DC"
    },
    "parameter-field-#2": {
      "id"    : "parameter-field-#2",
      "label" : "",
      "custom": false,
      "type"  : "DC",
    },
    "guard": {
      "id"    : "guard",
      "label" : "Guard",
      "custom": false,
      "type"  : "VDC",
      "invert": true,
      "source": "parameter-field-#2"
    },
    "parameter-field-#3": {
      "id"         : "parameter-field-#3",
      "name"       : "",
      "label"      : "",
      "custom"     : false,
      "type"       : "ADC"
    },
    "ade": {
      "id"         : "ade",
      "name"       : "",
      "label"      : "",
      "custom"     : false,
      "type"       : "ADC",
      "source"     : "abc",
    },
    "parameter-field-#4": {
      "id"         : "parameter-field-#4",
      "name"       : "fuel-level",
      "label"      : "Fuel level",
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
      "id"       : "send-command-to-device",
      "name"     : "Send command to device",
      "type"     : "CMD",
      "base"     : true,
      "module"   : "gate",
      "params": {
        "device-id": {
          "type" : "text",
          "value": undefined
        },
        "method"   : {
          "type" : "text",
          "value": undefined
        },
        "args": {
          "type" : "object",
          "value": undefined
        }
      }
    },
    "toggle-dry-contact": {
      "id"       : "toggle-dry-contact",
      "type"     : "CMD",
      "parent"   : "send-command-to-device",
      "base"     : null,
      "params": {
        "method": {
          "type" : "text",
          "value": "toggle"
        },
        "args" : {
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
      "id"       : "toggle-dry-contact#1",
      "type"     : "CMD",
      "parent"   : "toggle-dry-contact",
      "base"     : null,
      "params": {
        "args": {
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
      "id"       : "toggle-on-dry-contact#1",
      "type"     : "CMD",
      "parent"   : "toggle-dry-contact#1",
      "base"     : null,
      "params": {
        "args": {
          "type" : "object",
          "value": {
            "state"  : {
              "type" : "text",
              "value": "on"
            }
          }
        }
      }
    },
    "toggle-off-dry-contact#1": {
      "id"       : "toggle-off-dry-contact#1",
      "type"     : "CMD",
      "parent"   : "toggle-dry-contact#1",
      "base"     : null,
      "params": {
        "args": {
          "type" : "object",
          "value": {
            "state"  : {
              "type" : "text",
              "value": "off"
            }
          }
        }
      }
    },
  },
  "events"    : {
    "received-data": {
      "id"        : "received-data",
      "type"      : "EV",
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