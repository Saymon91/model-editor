class Form {
  constructor({ options = {}, templates = {}, data = {} } = {}, container = null) {
    this.options = options;
    this.templates = Object.assign(templates, {
      input   : '<input>',
      text    : '<input type="text">',
      number  : '<input type="number">',
      checkbox: '<input type="checkbox">',
      fieldset: '<fieldset></fieldset>',
      textarea: '<textarea></textarea>'
    });

    this.aliaces = {
      'boolean': 'checkbox',
      'string' : 'text',
      'group'  : 'fieldset',
      'text'   : 'textarea',
      'default': 'value'
    };

    this.container = container;
  }

  input(id, options) {
    return $(this.templates.input).attr(options).id(id);
  }

  text(id, options) {
    return $(this.templates.text).attr(options).id(id);
  }
  
  number(id, options) {
    return $(this.templates.number).attr(options).id(id);
  }
  
  

}
