export default class ParentCheckbox {
  private readonly rootElement: HTMLInputElement;
  #childElements: HTMLInputElement[] | null;
  #controller: AbortController | null = new AbortController();
  private destroyed = false;

  constructor(root: HTMLInputElement) {
    if (!root) {
      throw new Error('Root element missing.');
    }
    this.rootElement = root;
    const ids = this.rootElement.getAttribute('aria-controls')?.trim() ?? '';
    if (!ids) {
      console.warn('Child element IDs missing.');
    }
    this.#childElements = ids
      .split(/\s+/)
      .map((id) => {
        return document.getElementById(id);
      })
      .filter((elements): elements is HTMLInputElement => {
        return elements instanceof HTMLInputElement;
      });
    if (this.#childElements.length === 0) {
      console.warn('Child elements missing.');
    }
    this.initialize();
  }

  destroy(): void {
    if (this.destroyed || !this.#childElements || !this.#controller) {
      return;
    }
    this.destroyed = true;
    this.#controller.abort();
    this.#controller = null;
    this.rootElement.removeAttribute('data-parent-checkbox-initialized');
    this.#childElements = null;
  }

  private initialize(): void {
    if (!this.#childElements || !this.#controller) {
      return;
    }
    const { signal } = this.#controller;
    this.rootElement.addEventListener('change', this.handleRootChange, { signal });
    for (const child of this.#childElements) {
      child.addEventListener('change', this.handleChildChange, { signal });
    }
    this.update();
    this.rootElement.setAttribute('data-parent-checkbox-initialized', '');
  }

  private handleRootChange = (): void => {
    if (!this.#childElements) {
      return;
    }
    const { checked } = this.rootElement;
    this.rootElement.indeterminate = false;
    for (const child of this.#childElements) {
      child.checked = checked;
    }
  };

  private handleChildChange = (): void => {
    this.update();
  };

  private update(): void {
    if (!this.#childElements) {
      return;
    }
    let count = 0;
    for (const child of this.#childElements) {
      if (child.checked) {
        count++;
      }
    }
    const allChecked = count === this.#childElements.length;
    this.rootElement.checked = allChecked;
    this.rootElement.indeterminate = !allChecked && count > 0;
  }
}
