class Parameter {
  constructor(options = {}) {
    this.options = Object.assign({
      id          : null,
      name        : null,
      label       : null,
      custom      : false,
      defaultValue: undefined
    }, options);
  }

  form() {
    const { options = {} } = this;
    const form = $('<form action="" method="post" onSubmit="function () {return false}"></form>');
    form.append(`<input type="text" name="id" value="${options.id}">`);
    form.append(`<span>Label</span><input type="text" name="label" value="${options.name}">`);
    form.append(`<span>Label</span><input type="text" name="label" value="${options.id}">`);
    form.append(`<span>Customizable</span><input type="checkbox" name="custom" ${options.custom ? 'checked' : ''}>`);
    return form;
  }

  toJSON() {
    return this.options;
  }
}

class DigitalParameter extends Parameter {
  constructor(options = {}) {
    super(Object.assign({
      type  : 'DC',
      invert: false
    }, options));
  }

  form() {
    const form = super.form();
    form.append(`<span>DefaultValue</span><input type="number" name="defaultValue" min=0 max=1 step=1 value="${this.options.defaultValue}">`);
    form.append(`<input type="checkbox" name="invert" ${this.options.invert ? 'checked' : ''}>`);
    return form;
  }

  decode(value) {
    return this.options.invert ? !value : !!value;
  }

  encode(value) {
    return this.options.invert ? !value : !!value;
  }
}

class AnalogParameter extends Parameter {
  constructor(options) {
    super(Object.assign({
      type: 'ADC',
      decodeTable: {
        infra : ['x','return x;'],
        ultra : ['x','return x;'],
        except: ['x','return x;'],
        values: []
      },
      encodeTable: {
        infra : ['x','return x;'],
        ultra : ['x','return x;'],
        except: ['x','return x;'],
        values: []
      }
    }, options));
  }

  form() {
    const { options = {} } = this;
    const form = super.form();
    form.append(`<span>DefaultValue</span><input type="number" name="defaultValue" value="${this.options.defaultValue}">`);
    form.append(`<span>DefaultValue</span><input type="number" name="defaultValue" value="${this.options.defaultValue}">`);

    const settings = $('<fieldset id="settings"><legend>Settings</legend></fieldset>').appendTo(form);

    const decode = $('<fieldset id="decode"><legend>Decode</legend></fieldset>').appendTo(settings);
    decode.append(`<span>Infra</span><input type="text" name="decodeTable-infra" value="${options.decodeTable.infra}">`);
    decode.append(`<span>Ultra</span><input type="text" name="decodeTable-ultra" value="${options.decodeTable.ultra}">`);
    decode.append(`<span>Except</span><input type="text" name="decodeTable-except" value="${options.decodeTable.except}">`);
    let index = 0;
    for (const { from, to, fx } of options.decodeTable.values) {
      decode.append(`
<div class="values">
    <span>From</span><input type="number" name="decodeTable-values-${index}-from" step=0.001 value="${from}">    
    <span>To</span><input type="number" name="decodeTable-values-${index}-to" step=0.001 value="${to}">    
    <span>Fx</span><input type="text" name="decodeTable-values-${index}-fx" value="${fx}">
    <button class="remove" name="remove-decodeTable-values-${index}"
</div>`);
      index++;
    }

    const encode = $('<fieldset id="encode"><legend>Encode</legend></fieldset>').appendTo(settings);
    encode.append(`<span>Infra</span><input type="text" name="encodeTable-infra" value="${options.encodeTable.infra}">`);
    encode.append(`<span>Ultra</span><input type="text" name="encodeTable-ultra" value="${options.encodeTable.ultra}">`);
    encode.append(`<span>Except</span><input type="text" name="encodeTable-except" value="${options.encodeTable.except}">`);
    index = 0;
    for (const { from, to, fx } of options.encodeTable.values) {
      encode.append(`
<div class="values">
    <span>From</span><input type="number" name="encodeTable-values-${index}-from" step=0.001 value="${from}">    
    <span>To</span><input type="number" name="encodeTable-values-${index}-to" step=0.001 value="${to}">    
    <span>Fx</span><input type="text" name="encodeTable-values-${index}-fx" value="${fx}">
    <button class="remove" name="remove-encodeTable-values-${index}"
</div>`);
      index++;
    }

    return form;
  }


  static aproximate(value, { except, infra, ultra, values }) {
    if (!values.length) {
      return null;
    }
    if (infra && values[0].from !== undefined && values[0].from > value) {
      return new Function(...infra) || new Function(...except) || null;
    }
    if (ultra && values[values.length - 1].to !== undefined && values[values.length - 1].to < value) {
      return new Function(...ultra) || new Function(...except) || null;
    }

    for (const { from, to, fx } of values) {
      if (from <= value && to > value) {
        return new Function(...fx);
      }
    }

    return except ? new Function(...except) : null;
  }

  decode(value) {
    const func = AnalogParameter.aproximate(value, this.options.decodeTable);
    return func instanceof Function
      ? func(value)
      : value;
  }

  encode(value) {
    const func = AnalogParameter.aproximate(value, this.options.encodeTable);
    return func instanceof Function
      ? func(value)
      : value;
  }
}

class Virtual extends Parameter {

}


const model = {
  parameters: {
    'parameter-field-#1' : new DigitalParameter({
      id: 'parameter-field-#1',
      label: 'Test',
      name: 'parking'
    }),
    'parameter-field-#2' : new DigitalParameter({
      id: 'parameter-field-#2',
      label: 'Test1',
      name: 'guard',
      invert: true,
      custom: true
    }),
    'parameter-field-#3' : new AnalogParameter({
      id: 'parameter-field-#3',
      label: 'Test1',
      name: 'guard',
      custom: true,
      decodeTable: {
        infra : ['x','return x;'],
        ultra : ['x','return x;'],
        except: ['x','return x;'],
        values: [
          { from: 10, to: 20, fx: 'return 2 * x;' },
          { from: 20, to: 40, fx: 'return 1.5 * x;' },
        ]
      }
    }),
  },
  commands: {},
  events: {},
};

const mixins = {
  timers: {
    commands: {},
    events: {},
  },
  schedulers: {
    commands: {},
    events: {},
  }
};