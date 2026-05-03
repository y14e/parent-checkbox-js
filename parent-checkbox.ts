/**
 * parent-checkbox.ts
 *
 * @version 1.0.0
 * @author Yusuke Kamiyamane
 * @license MIT
 * @copyright Copyright (c) 2026 Yusuke Kamiyamane
 * @see {@link https://github.com/y14e/parent-checkbox-ts}
 */

// -----------------------------------------------------------------------------
// [APIs]
// -----------------------------------------------------------------------------

export default class ParentCheckbox {
  #rootElement: HTMLInputElement;
  #childElements: HTMLInputElement[] | null;
  #controller: AbortController | null = new AbortController();
  #isDestroyed = false;

  constructor(root: HTMLInputElement) {
    if (!(root instanceof HTMLInputElement)) {
      throw new Error('Root element missing');
    }

    this.#rootElement = root;
    const ids = root.getAttribute('aria-controls')?.trim() ?? '';

    if (ids === '') {
      console.warn('Child element IDs missing');
    }

    this.#childElements = ids
      .split(/\s+/)
      .map((id) => document.getElementById(id))
      .filter((element) => element instanceof HTMLInputElement);

    if (this.#childElements.length === 0) {
      console.warn('Child element missing');
    }

    this.#initialize();
  }

  destroy(): void {
    if (this.#isDestroyed) {
      return;
    }

    this.#isDestroyed = true;
    this.#controller?.abort();
    this.#controller = null;
    this.#rootElement.removeAttribute('data-parent-checkbox-initialized');
    this.#childElements = null;
  }

  #initialize() {
    if (!this.#controller) {
      return;
    }

    const { signal } = this.#controller;
    this.#rootElement.addEventListener('change', this.#onRootChange, {
      signal,
    });

    this.#childElements?.forEach((child) => {
      child.addEventListener('change', this.#onChildChange, { signal });
    });

    this.#update();
    this.#rootElement.setAttribute('data-parent-checkbox-initialized', '');
  }

  #update() {
    if (!this.#childElements) {
      return;
    }

    const isAllChecked = this.#childElements.every((child) => child.checked);
    this.#rootElement.checked = isAllChecked;
    this.#rootElement.indeterminate =
      !isAllChecked && this.#childElements.some((child) => child.checked);
  }

  #onRootChange = () => {
    this.#rootElement.indeterminate = false;
    const isChecked = this.#rootElement.checked;

    this.#childElements?.forEach((child) => {
      child.checked = isChecked;
    });
  };

  #onChildChange = () => {
    this.#update();
  };
}
