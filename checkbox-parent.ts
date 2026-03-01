export default class CheckboxParent {
  private rootElement!: HTMLInputElement;
  private childElements!: HTMLInputElement[];
  private eventController!: AbortController;
  private destroyed!: boolean;

  constructor(root: HTMLInputElement) {
    if (!root) return;
    this.rootElement = root;
    this.childElements =
      this.rootElement
        .getAttribute('aria-controls')
        ?.split(' ')
        .map(id => document.getElementById(id) as HTMLInputElement)
        .filter(Boolean) || [];
    if (!this.childElements.length) return;
    this.eventController = new AbortController();
    this.destroyed = false;
    this.handleRootChange = this.handleRootChange.bind(this);
    this.handleChildChange = this.handleChildChange.bind(this);
    this.initialize();
  }

  private initialize(): void {
    const { signal } = this.eventController;
    this.rootElement.addEventListener('change', this.handleRootChange, { signal });
    this.childElements.forEach(child => child.addEventListener('change', this.handleChildChange, { signal }));
    this.update();
    this.rootElement.setAttribute('data-checkbox-parent-initialized', '');
  }

  private update(): void {
    const checked = this.childElements.every(child => child.checked);
    Object.assign(this.rootElement, {
      checked: checked,
      indeterminate: !checked && this.childElements.some(child => child.checked),
    });
  }

  private handleRootChange(): void {
    const checked = this.rootElement.checked;
    this.childElements.forEach(child => {
      child.checked = checked;
    });
  }

  private handleChildChange(): void {
    this.update();
  }

  destroy(): void {
    if (this.destroyed) return;
    this.rootElement.removeAttribute('data-checkbox-parent-initialized');
    this.eventController.abort();
    this.destroyed = true;
  }
}
