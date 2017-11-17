class ModelItem {
  constructor(options, model) {
    Object.assign(this, { options, model });
  }
}

class Parameter extends ModelItem {
  constructor(options = {}, model) {
    super(Object.assign({
      id          : null,
      name        : null,
      label       : null,
      custom      : false,
      exclusive   : false,
      base        : 'state',
      defaultValue: undefined
    }, options), model);
  }

  toJSON() {
    return this.options;
  }

  settingsForm(customOnly = false) {
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

  customForm() {
    return this.settingsForm(true);
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

  settingsForm(customOnly = false) {
    const form = super.settingsForm(customOnly);
    if (!form) {
      return false;
    }

    form.append(`<span>Exclusive</span><input type="checkbox" name="exclusive" ${this.options.exclusive ? 'checked' : ''}>`);
    form.append(`<span>DefaultValue</span><input type="text" name="defaultValue" value="${this.options.defaultValue || ''}">`);
    return form;
  }

  source({ parameters }) {
    const { name, exclusive, defaultValue, value } = this.options;
    return exclusive
      ? value === undefined ? defaultValue : value
      : parameters === undefined ? defaultValue : parameters[name] === undefined ? defaultValue : parameters[name];
  }
}


class DigitalParameter extends Parameter {
  constructor(options = {}, model) {
    super(Object.assign({
      type: 'DC',
    }, options), model);
  }

  form(customOnly = false) {
    const form = super.settingsForm(customOnly);
    if (!form) {
      return form;
    }

    form.append(`
<span>DefaultValue</span>
<input type="number" name="defaultValue" min=0 max=1 step=1 value="${this.options.defaultValue || ''}">
<input type="checkbox" name="customisable" value="defaultValue">`
    );
    return form;
  }
}

class AnalogParameter extends Parameter {
  constructor(options = {}, model) {
    super(Object.assign({
      type: 'ADC',
    }, options), model);
  }

  settingsForm(customOnly = false) {
    const form = super.settingsForm(customOnly);
    return form
      ? form.append(`<span>DefaultValue</span><input type="number" name="defaultValue" step=0.001 value="${this.options.defaultValue || 0}">`)
      : form;
  }
}


class VirtualAnalogParameter extends AnalogParameter {
  constructor(options = {}, model) {
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
    }, options), model);
  }

  settingsForm(customOnly = false) {
    const form = super.settingsForm(customOnly);
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

    for (const id in this.model.configuration.parameters) {
      const { label, name } = this.model.get(id).options;
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
    if (func instanceof Function) {
      const result = func(value, object);
      return result === undefined ? defaultValue : result;
    }

    return value;
  }

  source(object) {
    const result = this.model.get(this.options.source).value(object);
    return result === undefined ? this.options.defaultValue : result;
  }
}

class VirtualDigitalParameter extends DigitalParameter {
  constructor(options = {}, model) {
    super(Object.assign({
      virtual: true,
      source : null,
      invert : false
    }, options), model);
  }

  settingsForm(customOnly = false) {
    const form = super.settingsForm(customOnly);
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

class Event extends ModelItem {
  constructor(options = {}, model) {
    super(Object.assign({
      type: 'EV'
    }, options), model);
  }

  settingsForm() {

  }
}

/*
class Command extends Function {
  constructor(options = {}, model) {
    super('params', '');

    Object.assign(this, {
      options: Object.assign({ type: 'CMD' }, options),
      model
    });
  }

  settingsForm() {
    const { id, name, label, base } = this.options;
    let { parent, params } = this.options;

    const form = $('<form action="" method="post" onSubmit="function () {return false}"></form>');
    form.append(`<span>Id</span><input type="text" name="id" value="${id}" ${base ? 'disabled' : ''}>`);
    form.append(`<span>Name</span><input type="text" name="name" value="${name || ''}" ${base ? 'disabled' : ''}>`);
    form.append(`<span>Label</span><input type="text" name="label" value="${label || ''}" ${base ? 'disabled' : ''}>`);
    const parentSelector = form.append(`<span>Label</span><select name="" ${base ? 'disabled' : ''}><option value="" ${parent ? '' : 'selected'}>-</option></select>`).find('select');
    for (const commandId in this.model.commands) {
      const { name, label } = this.model.get(commandId);
      parentSelector.append($(new Option(label || name || commandId, commandId, false, commandId === parent)));
    }

    let paramsDiff = [Object.assign({}, params)];

    while (parent) {
      const { params = null } = this.model.get(parent).options;
      params && paramsDiff.push(Object.assign({}, params));
      parent = this.model.get(parent).parent || null;
    }

    paramsDiff = paramsDiff.reverse();

    console.log(paramsDiff);

    return form;
  }

  useForm() {

  }
}
*/

class Command extends Function {
  constructor(options = {}, model = {}) {
    super('args', 'return arguments.callee');
    Object.assign(this, { options, model });
  }

  settingsForm() {
    const { id, name, label, base } = this.options;
    let { parent, params } = this.options;

    const form = $('<form action="" method="post" onSubmit="function () {return false}"></form>');
    form.append(`<span>Id</span><input type="text" name="id" value="${id}" ${base ? 'disabled' : ''}>`);
    form.append(`<span>Name</span><input type="text" name="name" value="${name || ''}" ${base ? 'disabled' : ''}>`);
    form.append(`<span>Label</span><input type="text" name="label" value="${label || ''}" ${base ? 'disabled' : ''}>`);
    const parentSelector = form.append(`<span>Label</span><select name="" ${base ? 'disabled' : ''}><option value="" ${parent ? '' : 'selected'}>-</option></select>`).find('select');
    for (const commandId in this.model.commands) {
      const { name, label } = this.model.get(commandId);
      parentSelector.append($(new Option(label || name || commandId, commandId, false, commandId === parent)));
    }

    let paramsDiff = [params];

    while (parent) {
      const { params = null } = this.model.get(parent).options;
      params && paramsDiff.push(params);
      parent = this.model.get(parent).parent || null;
    }

    paramsDiff = paramsDiff.reverse();

    console.log(paramsDiff);

    return form;
  }
}

class Model {
  constructor(configuration = {}) {
    this.configuration = configuration;
    this.items = {};

    this.controllers = {
      DC  : DigitalParameter,
      ADC : AnalogParameter,
      VADC: VirtualAnalogParameter,
      VDC : VirtualDigitalParameter,
      EV  : Event,
      CMD : Command
    };

    this.build();
  }

  build() {
    for (const part in this.configuration) {
      for (const itemId in this.configuration[part]) {
        const item = this.configuration[part][itemId];
        this.items[itemId] = new this.controllers[item.type](item, this);
      }
    }
  }

  toJSON() {
    return this.configuration
  }

  get(id) {
    return this.items[id];
  }
}


class Editor {
  constructor() {

  }

  mount(container) {
    this.container = container.find('#editor');
    this.elements = {
      tree    : this.container.find('#three'),
      console : this.container.find('#console'),
    };

    return this;
  }

  build(model) {
    model = new Model(model);

    for (const part in model.configuration) {
      const container = $(`<fieldset id="${part}"><legend>${part}</legend></fieldset>`).appendTo(this.elements.tree);

      for (const elementId in model.configuration[part]) {
        const item = model.get(elementId);
        $(`<div id="label-${elementId}">${elementId}</div>`).appendTo(container).click(() => {
          this.elements.console.empty();
          this.elements.console.append(item.settingsForm(false));
        });
      }
    }

    return model;
  }
}

function call(...args) {
  console.log(...args);
}
