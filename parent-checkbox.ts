export default class ParentCheckbox {
  private readonly rootElement: HTMLInputElement;
  private readonly childElements: HTMLInputElement[];
  private readonly controller = new AbortController();
  private destroyed = false;

  constructor(root: HTMLInputElement) {
    if (!root) throw new Error('Root element missing');
    this.rootElement = root;
    this.childElements = (this.rootElement.getAttribute('aria-controls') ?? '')
      .trim()
      .split(/\s+/)
      .map((id) => document.getElementById(id))
      .filter((elements): elements is HTMLInputElement => elements instanceof HTMLInputElement);
    if (this.childElements.length === 0) throw new Error('Child elements missing');
    this.initialize();
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.controller.abort();
    this.rootElement.removeAttribute('data-parent-checkbox-initialized');
  }

  private initialize(): void {
    const { signal } = this.controller;
    this.rootElement.addEventListener('change', this.handleRootChange, { signal });
    for (const child of this.childElements) {
      child.addEventListener('change', this.handleChildChange, { signal });
    }
    this.update();
    this.rootElement.setAttribute('data-parent-checkbox-initialized', '');
  }

  private handleRootChange = (): void => {
    const { checked } = this.rootElement;
    this.rootElement.indeterminate = false;
    for (const child of this.childElements) {
      child.checked = checked;
    }
  };

  private handleChildChange = (): void => {
    this.update();
  };

  private update(): void {
    let count = 0;
    for (const child of this.childElements) {
      if (child.checked) {
        count++;
      }
    }
    const every = count === this.childElements.length;
    this.rootElement.checked = every;
    this.rootElement.indeterminate = !every && count > 0;
  }
}
