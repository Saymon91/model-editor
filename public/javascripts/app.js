class App {
  constructor() {
    this.container = $(document.body);

    this.nav = new Nav();
    this.editor = new Editor();
    this.editor.mount(this.container);
    const buildModel = this.editor.build(model);

    console.log(buildModel);

    this.container.find('#viewer').append(`<pre>${JSON.stringify(buildModel, true, 2)}</pre>`);
  }
}

window.onload = () => {
  window.app = new App();
};