class Editor {
  constructor() {
    this.listeners = {};
    this.eventsQueue = [];
  }

  mount(container) {
    this.container = container.find('#editor');
    this.elements = {
      tree    : this.container.find('#three'),
      console : this.container.find('#console'),
    };

    return this;
  }

  build() {
    for (const commandId in model.parameters) {
      $(`<div id="label-${commandId}">${commandId}</div>`).appendTo(this.elements.tree).click(() => {
        this.elements.console.empty();
        this.elements.console.append(model.parameters[commandId].form());
      });
    }
  }

  // Events
  on(event, handler) {
    this.listeners[event]
      ? this.listeners[event].push(handler)
      : this.listeners[event] = [handler];

    return this;
  }

  emit(event, ...args) {
    const { [event]: listeners } = this.listeners;
    if (!listeners) {
      return this;
    }

    for (const handler of listeners) {
      try {
        handler(...args);
      } catch (err) {
        console.error(new Error(`Error handle event "${event}" with arguments ${JSON.stringify(args)} in handler "${handler.toString()}"`));
        console.error(err);
      }
    }

    return this;
  }

  removeListener(event, handler) {
    const { [event]: listeners } = this.listeners;
    if (!listeners) {
      return this;
    }

    this.listeners[event] = listeners.filter(issetHandler => issetHandler !== handler);
    return this;
  }


}