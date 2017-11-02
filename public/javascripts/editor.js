class Parameter {
  constructor(options = {}) {
    this.options = Object.assign({
      id          : null,
      name        : null,
      label       : null,
      custom      : false,
      exclusive   : false,
      base        : 'state',
      defaultValue: undefined
    }, options);
  }

  toJSON() {
    return this.options;
  }

  form(customOnly = false) {
    const { id, name, custom, label } = this.options;
    if (customOnly && !custom) {
      return false;
    }

    const form = $('<form action="" method="post" onSubmit="function () {return false}"></form>');
    form.append(`<span>Id</span><input type="text" name="id" value="${id}">`);
    form.append(`<span>Name</span><input type="text" name="name" value="${name}">`);
    form.append(`<span>Label</span><input type="text" name="label" value="${label}">`);
    form.append(`<span>Customizable</span><input type="checkbox" name="custom" ${custom ? 'checked' : ''}>`);
    return form;
  }

  value(object) {
    return this.source(object);
  }

  source(object) {
    const { name, base, defaultValue } = this.options;
    return object[base] === undefined
      ? defaultValue
      : object[base][name] === undefined
        ? defaultValue : object[base][name];
  }
}

class StaticParameter extends Parameter {
  constructor(options = {}) {
    super(Object.assign(Object.freeze({ static: true, custom: false }), { value: null, exclusive: false }, options));
  }

  form(customOnly = false) {
    const form = super.form(customOnly);
    if (!form) {
      return false;
    }

    form.append(`<span>Exclusive</span><input type="checkbox" name="exclusive" ${this.options.exclusive ? 'checked' : ''}>`);
    form.append(`<span>DefaultValue</span><input type="text" name="defaultValue" value="${this.options.defaultValue}">`);
    return form;
  }

  source({ parameters }) {
    const { name, exclusive, defaultValue, value } = this.options;
    return exclusive
      ? value === undefined ? defaultValue : value
      : parameters === undefined ? defaultValue : parameters[name] === undefined ? defaultValue : parameters[name];
  }

  value(object) {
    return this.source(object);
  }
}


class DigitalParameter extends Parameter {
  constructor(options = {}) {
    super(Object.assign({
      type: 'DC',
    }, options));
  }

  form(customOnly = false) {
    const form = super.form(customOnly);
    if (!form) {
      return form;
    }

    form.append(`
<span>DefaultValue</span>
<input type="number" name="defaultValue" min=0 max=1 step=1 value="${this.options.defaultValue}">
<input type="checkbox" name="customisable" value="defaultValue">`
    );
    return form;
  }
}

class AnalogParameter extends Parameter {
  constructor(options) {
    super(Object.assign({
      type: 'ADC',
    }, options));
  }

  form(customOnly = false) {
    const form = super.form(customOnly);
    return form
      ? form.append(`<span>DefaultValue</span><input type="number" name="defaultValue" step=0.001 value="${this.options.defaultValue}">`)
      : form;
  }
}


class VirtualAnalogParameter extends AnalogParameter {
  constructor(options = {}) {
    super(Object.assign({
      virtual    : true,
      source     : null,
      min        : undefined,
      max        : undefined,
      table: {
        infra : ['x', 'return x;'],
        ultra : ['x', 'return x;'],
        except: ['x', 'return x;'],
        values: []
      }
    }, options));
  }

  form(customOnly = false, { parameters }) {
    const form = super.form(customOnly);
    if (!form) {
      return form;
    }

    const { source, table } = this.options;
    form.append($(`
<span>Source</span>
<select name="source">
    <option value="" ${source ? '' : 'selected'}>-</option>
</select>`));
    const sourceSelector = form.find('select[name="source"]');

    for (const id in parameters) {
      const { label, name } = parameters[id];
      sourceSelector.append($(new Option(label || name || id, id, false, id === source)));
    }

    const settings = $('<fieldset id="settings"><legend>Settings</legend></fieldset>').appendTo(form);

    const decode = $('<fieldset id="decode"><legend>Decode</legend></fieldset>').appendTo(settings);
    decode.append(`<span>Infra</span><input type="text" name="table-infra" value="${table.infra}">`);
    decode.append(`<span>Ultra</span><input type="text" name="table-ultra" value="${table.ultra}">`);
    decode.append(`<span>Except</span><input type="text" name="table-except" value="${table.except}">`);
    let index = 0;
    for (const { from, to, fx } of table.values) {
      decode.append(`
<div class="values">
    <span>From</span><input type="number" name="table-values-${index}-from" step=0.001 value="${from}">    
    <span>To</span><input type="number" name="table-values-${index}-to" step=0.001 value="${to}">    
    <span>Fx</span><input type="text" name="table-values-${index}-fx" value="${fx}">
    <button class="remove" name="remove-table-values-${index}"
</div>`);
      index++;
    }

    return form;
  }

  static aproximate(value, { except, infra, ultra, values, min, max }) {
    if (!values.length) {
      return null;
    }
    if (infra && ((min !== undefined && value < min) || (values[0].from !== undefined && values[0].from > value))) {
      return new Function(...infra) || new Function(...except) || null;
    }
    if (ultra && ((max !== undefined && value > max) || (values[values.length - 1].to !== undefined && values[values.length - 1].to < value))) {
      return new Function(...ultra) || new Function(...except) || null;
    }

    for (const { from, to, fx } of values) {
      if (from <= value && to > value) {
        return new Function(...fx);
      }
    }

    return except ? new Function(...except) : null;
  }

  value(object) {
    const { table, defaultValue } = this.options;
    let value = this.source(object);

    const func = AnalogParameter.aproximate(value, table);
    return func instanceof Function
      ? func(value, model)
      : value;
  }

  source(object) {
    return object.model.parameters[this.options.source].value(object);
  }
}

class VirtualDigitalParameter extends DigitalParameter {
  constructor(options = {}) {
    super(Object.assign({
      virtual: true,
      source: null,
      invert: false
    }, options));
  }

  form(customOnly = false) {
    const form = super.form(customOnly);
    if (!form) {
      return form;
    }

    form.append(`<span>Invert</span><input type="checkbox" name="invert" ${this.options.invert ? 'checked' : ''}>`);
    return form;
  }

  value(packet) {
    const { source, invert } = this.options;
    return invert ? !packet[source] : !!packet[source];
  }

  source(packet) {
    return !!packet[this.options.source];
  }
}

class Editor {
  constructor() {
    this.listeners = {};
    this.eventsQueue = [];

    this.controllers = {
      DC  : DigitalParameter,
      ADC : AnalogParameter,
      VADC: VirtualAnalogParameter,
      VDC : VirtualDigitalParameter
    }
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
      const parameter = model.parameters[commandId];
      $(`<div id="label-${commandId}">${commandId}</div>`).appendTo(this.elements.tree).click(() => {
        this.elements.console.empty();
        this.elements.console.append(new this.controllers[parameter.type](parameter).form(false, model));
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