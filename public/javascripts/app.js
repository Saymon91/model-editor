class App {
  constructor() {
    this.container = $(document.body);

    this.nav = new Nav();
    this.editor = new Editor();
    this.editor.mount(this.container);
    this.editor.build();

    this.container.find('#viewer').append(`<pre>${JSON.stringify(model, true, 2)}</pre>`);
  }
}

window.onload = () => {
  window.app = new App();
};