export default class ParentCheckbox {
  private rootElement!: HTMLInputElement;
  private childElements!: HTMLInputElement[];
  private controller!: AbortController;
  private destroyed!: boolean;

  constructor(root: HTMLInputElement) {
    if (!root) return;
    this.rootElement = root;
    this.childElements =
      this.rootElement
        .getAttribute('aria-controls')
        ?.split(' ')
        .map((id) => document.getElementById(id) as HTMLInputElement)
        .filter(Boolean) || [];
    if (!this.childElements.length) return;
    this.controller = new AbortController();
    this.destroyed = false;
    this.handleRootChange = this.handleRootChange.bind(this);
    this.handleChildChange = this.handleChildChange.bind(this);
    this.initialize();
  }

  private initialize(): void {
    const { signal } = this.controller;
    this.rootElement.addEventListener('change', this.handleRootChange, { signal });
    this.childElements.forEach((child) => void child.addEventListener('change', this.handleChildChange, { signal }));
    this.update();
    this.rootElement.setAttribute('data-parent-checkbox-initialized', '');
  }

  private update(): void {
    const checked = this.childElements.every((child) => child.checked);
    this.rootElement.checked = checked;
    this.rootElement.indeterminate = !checked && this.childElements.some((child) => child.checked);
  }

  private handleRootChange(): void {
    const { checked } = this.rootElement;
    this.childElements.forEach((child) => {
      child.checked = checked;
    });
  }

  private handleChildChange(): void {
    this.update();
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.rootElement.removeAttribute('data-parent-checkbox-initialized');
    this.controller.abort();
  }
}
