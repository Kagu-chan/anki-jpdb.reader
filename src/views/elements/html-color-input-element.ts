import { clamp, hsvToRgb, parseHex, rgbToHex, rgbToHsv, type HSV } from '@shared/color/conversions';
import { PresetColor } from '@shared/configuration/types';
import { createElement } from '@shared/dom/create-element';
import { hasColor, resolveColorStyle, toColorString } from '@shared/style-presets/color';

const observedAttributes = ['value', 'name'] as const;

type ObservedAttributes = (typeof observedAttributes)[number];

const DEFAULT_HSV: HSV = { h: 0, s: 0.6, v: 0.9 };

const PREVIEW_SAMPLE = { before: 'これは', word: '見本', after: 'の単語です。' };

interface PickerState {
  hsv: HSV;
  alpha: number;
  colorEnabled: boolean;
  styleEnabled: boolean;
  style: string;
}

/**
 * A real color picker for `PresetColor`: a swatch button that opens a modal with a
 * saturation/value square + hue/alpha sliders + hex/RGB fields on the left, and a raw `style`
 * template override on the right, with a live preview of the resolved CSS rule. Same value/name
 * attribute contract as the other settings-page custom elements, so the settings page needs no
 * special-casing.
 */
export class HTMLColorInputElement extends HTMLElement {
  public static observedAttributes = observedAttributes;

  private _swatchFill: HTMLSpanElement;
  private _swatchBadge: HTMLSpanElement;
  private _swatchHex: HTMLSpanElement;

  private _overlayBackdrop: HTMLDivElement | undefined;
  private _overlay: HTMLDivElement | undefined;
  private _overlayTitle: HTMLHeadingElement;
  private _svCanvas: HTMLCanvasElement;
  private _svThumb: HTMLDivElement;
  private _hueRange: HTMLInputElement;
  private _hueNumber: HTMLInputElement;
  private _alphaRange: HTMLInputElement;
  private _alphaNumber: HTMLInputElement;
  private _hexInput: HTMLInputElement;
  private _rInput: HTMLInputElement;
  private _gInput: HTMLInputElement;
  private _bInput: HTMLInputElement;
  private _colorToggle: HTMLInputElement;
  private _colorPane: HTMLDivElement;
  private _styleToggle: HTMLInputElement;
  private _stylePane: HTMLDivElement;
  private _styleTextarea: HTMLTextAreaElement;
  private _resolvedCss: HTMLDivElement;
  private _previewStrip: HTMLDivElement;

  private _svDragging = false;
  private _state: PickerState = {
    hsv: DEFAULT_HSV,
    alpha: 1,
    colorEnabled: false,
    styleEnabled: false,
    style: '',
  };

  //#region Attributes

  public get value(): PresetColor {
    return JSON.parse(this.getAttribute('value') ?? '{}') as PresetColor;
  }
  public set value(value: PresetColor) {
    this.setAttribute('value', JSON.stringify(value));
  }

  public get name(): string {
    return this.getAttribute('name')!;
  }
  public set name(value: string) {
    this.setAttribute('name', value);
  }

  //#endregion
  //#region Lifecycle

  public connectedCallback(): void {
    this.buildSwatch();
    this.renderSwatch();
  }

  public disconnectedCallback(): void {
    this._overlayBackdrop?.remove();
    this._overlay?.remove();
  }

  public attributeChangedCallback(
    name: ObservedAttributes,
    oldValue: unknown,
    newValue: unknown,
  ): void {
    const pascalCaseName = name.replace(/(^\w|-\w)/g, (a) => a.replace(/-/, '').toUpperCase());
    const functionName = `on${pascalCaseName}Changed`;
    const changeHandler = this[functionName as keyof this] as
      | ((oldValue: unknown, newValue: unknown) => void | Promise<void>)
      | undefined;

    if (changeHandler) {
      changeHandler.apply(this, [oldValue, newValue]);
    }
  }

  //#endregion
  //#region Events

  protected onValueChanged(oldValue: string, newValue: string): void {
    this.renderSwatch();

    if (oldValue !== newValue) {
      this.dispatchEvent(new Event('change'));
    }
  }

  //#endregion
  //#region Swatch

  private buildSwatch(): void {
    this._swatchFill = createElement('span', { class: 'fill' });
    this._swatchBadge = createElement('span', { class: 'style-badge', innerText: '{}' });
    this._swatchHex = createElement('span', { class: 'swatch-hex' });

    const swatchButton = createElement('button', {
      class: 'swatch-btn',
      attributes: { type: 'button' },
      children: [
        { tag: 'span', class: 'swatch', children: [this._swatchFill, this._swatchBadge] },
        this._swatchHex,
      ],
      handler: () => this.openOverlay(),
    });

    this.appendChild(swatchButton);
  }

  private renderSwatch(): void {
    const preset = this.value;
    const color = toColorString(preset);

    this._swatchFill.style.backgroundColor = color || 'transparent';
    this._swatchBadge.style.display = preset.style ? '' : 'none';
    this._swatchHex.textContent = color || 'inherit';
    this._swatchHex.classList.toggle('is-empty', !color);
  }

  //#endregion
  //#region Overlay lifecycle

  private ensureOverlay(): void {
    if (this._overlay) {
      return;
    }

    this.buildOverlay();
    document.body.appendChild(this._overlayBackdrop!);
    document.body.appendChild(this._overlay!);
  }

  private rowLabel(): string {
    const label = document.querySelector(`label[for="${this.id}"]`)?.textContent;

    return label?.trim() || this.name;
  }

  private openOverlay(): void {
    this.ensureOverlay();

    this._overlayTitle.textContent = this.rowLabel();

    const preset = this.value;

    this._state = {
      hsv: hasColor(preset) ? rgbToHsv(preset) : DEFAULT_HSV,
      alpha: preset.a ?? 1,
      colorEnabled: hasColor(preset),
      styleEnabled: typeof preset.style === 'string',
      style: preset.style ?? '',
    };

    this.syncControlsFromState();

    this._overlayBackdrop!.classList.add('is-open');
    this._overlay!.classList.add('is-open');
  }

  private closeOverlay(): void {
    this._overlayBackdrop?.classList.remove('is-open');
    this._overlay?.classList.remove('is-open');
  }

  private applyAndClose(): void {
    this.value = this.buildPresetFromState();
    this.closeOverlay();
  }

  //#endregion
  //#region Overlay DOM

  private buildOverlay(): void {
    this._overlayTitle = createElement('h3');
    this._svThumb = createElement('div', { class: 'sv-thumb' });
    this._svCanvas = createElement('canvas', { attributes: { width: '280', height: '187' } });

    this._hueRange = createElement('input', {
      attributes: { type: 'range', min: '0', max: '360', step: '1' },
    });
    this._hueNumber = createElement('input', {
      class: 'num-input',
      attributes: { type: 'number', min: '0', max: '360', step: '1' },
    });
    this._alphaRange = createElement('input', {
      class: 'checker-track',
      attributes: { type: 'range', min: '0', max: '100', step: '1' },
    });
    this._alphaNumber = createElement('input', {
      class: 'num-input',
      attributes: { type: 'number', min: '0', max: '100', step: '1' },
    });

    this._hexInput = createElement('input', {
      class: 'text-input',
      attributes: { type: 'text', spellcheck: 'false', maxlength: '7' },
    });
    this._rInput = createElement('input', {
      attributes: { type: 'number', min: '0', max: '255' },
    });
    this._gInput = createElement('input', {
      attributes: { type: 'number', min: '0', max: '255' },
    });
    this._bInput = createElement('input', {
      attributes: { type: 'number', min: '0', max: '255' },
    });

    this._colorToggle = createElement('input', { attributes: { type: 'checkbox' } });
    this._styleToggle = createElement('input', { attributes: { type: 'checkbox' } });
    this._styleTextarea = createElement('textarea', {
      class: 'style-textarea',
      attributes: { spellcheck: 'false', placeholder: 'color: ${color};' },
    });
    this._resolvedCss = createElement('div', { class: ['resolved-css', 'always-visible'] });
    this._previewStrip = createElement('div', { class: 'preview-strip' });

    this._colorPane = createElement('div', {
      class: 'pane',
      children: [
        {
          tag: 'div',
          class: 'pane-title',
          children: [
            { tag: 'span', innerText: 'Color' },
            this.buildToggle(this._colorToggle, 'Set color'),
          ],
        },
        {
          tag: 'div',
          class: 'pane-body',
          children: [
            {
              tag: 'div',
              class: 'sv-square',
              children: [this._svCanvas, this._svThumb],
            },
            {
              tag: 'div',
              class: 'slider-row',
              children: [{ tag: 'label', innerText: 'Hue' }, this._hueRange, this._hueNumber],
            },
            {
              tag: 'div',
              class: 'slider-row',
              children: [{ tag: 'label', innerText: 'Alpha' }, this._alphaRange, this._alphaNumber],
            },
            {
              tag: 'div',
              class: 'rgb-hex-row',
              children: [
                {
                  tag: 'div',
                  class: ['field', 'hex'],
                  children: [{ tag: 'label', innerText: 'Hex' }, this._hexInput],
                },
                {
                  tag: 'div',
                  class: ['field', 'rgb'],
                  children: [{ tag: 'label', innerText: 'R' }, this._rInput],
                },
                {
                  tag: 'div',
                  class: ['field', 'rgb'],
                  children: [{ tag: 'label', innerText: 'G' }, this._gInput],
                },
                {
                  tag: 'div',
                  class: ['field', 'rgb'],
                  children: [{ tag: 'label', innerText: 'B' }, this._bInput],
                },
              ],
            },
          ],
        },
      ],
    });

    this._stylePane = createElement('div', {
      class: 'pane',
      children: [
        {
          tag: 'div',
          class: 'pane-title',
          children: [
            { tag: 'span', innerText: 'Custom style' },
            this.buildToggle(this._styleToggle, 'Override'),
          ],
        },
        {
          tag: 'div',
          class: 'pane-body',
          children: [
            this._styleTextarea,
            {
              tag: 'p',
              class: 'style-hint',
              children: [
                { tag: 'span', innerText: 'Use ' },
                { tag: 'code', innerText: '${color}' },
                {
                  tag: 'span',
                  innerText:
                    " anywhere the picked color should be inserted — it's replaced with the resolved hex/rgba value. Defaults to ",
                },
                { tag: 'code', innerText: 'color: ${color}' },
                { tag: 'span', innerText: ' when no override is set.' },
              ],
            },
            {
              tag: 'div',
              class: ['resolved-label', 'always-visible'],
              innerText: 'Resolved rule',
            },
            this._resolvedCss,
          ],
        },
      ],
    });

    this._overlayBackdrop = createElement('div', {
      class: 'backdrop',
      handler: () => this.closeOverlay(),
    });

    this._overlay = createElement('div', {
      class: ['overlay', 'split-panes', 'color-picker-overlay'],
      attributes: { role: 'dialog', 'aria-modal': 'true' },
      children: [
        {
          tag: 'div',
          class: 'overlay-header',
          children: [
            this._overlayTitle,
            {
              tag: 'button',
              class: 'overlay-close',
              attributes: { type: 'button', 'aria-label': 'Close' },
              innerText: '×',
              handler: (): void => this.closeOverlay(),
            },
          ],
        },
        {
          tag: 'div',
          class: 'overlay-body',
          children: [this._colorPane, this._stylePane],
        },
        {
          tag: 'div',
          class: 'overlay-footer',
          children: [
            this._previewStrip,
            {
              tag: 'div',
              class: 'actions',
              children: [
                {
                  tag: 'button',
                  class: 'btn',
                  attributes: { type: 'button' },
                  innerText: 'Cancel',
                  handler: (): void => this.closeOverlay(),
                },
                {
                  tag: 'button',
                  class: ['btn', 'primary'],
                  attributes: { type: 'button' },
                  innerText: 'Apply',
                  handler: (): void => this.applyAndClose(),
                },
              ],
            },
          ],
        },
      ],
    });

    this.registerOverlayEvents();
  }

  private buildToggle(input: HTMLInputElement, label: string): HTMLLabelElement {
    return createElement('label', {
      class: 'switch',
      children: [input, { tag: 'span', class: 'track' }, { tag: 'span', innerText: label }],
    });
  }

  //#endregion
  //#region Color math wiring

  private currentRgb(): { r: number; g: number; b: number } {
    return hsvToRgb(this._state.hsv);
  }

  private buildPresetFromState(): PresetColor {
    if (!this._state.colorEnabled && !this._state.styleEnabled) {
      return {};
    }

    const preset: PresetColor = {};

    if (this._state.colorEnabled) {
      const { r, g, b } = this.currentRgb();

      preset.r = r;
      preset.g = g;
      preset.b = b;

      if (this._state.alpha < 1) {
        preset.a = Math.round(this._state.alpha * 100) / 100;
      }
    }

    if (this._state.styleEnabled && this._state.style.trim()) {
      preset.style = this._state.style;
    }

    return preset;
  }

  private drawSvSquare(): void {
    const ctx = this._svCanvas.getContext('2d')!;
    const { width, height } = this._svCanvas;
    const { r, g, b } = hsvToRgb({ h: this._state.hsv.h, s: 1, v: 1 });

    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, 0, width, height);

    const saturationGradient = ctx.createLinearGradient(0, 0, width, 0);

    saturationGradient.addColorStop(0, 'rgba(255,255,255,1)');
    saturationGradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = saturationGradient;
    ctx.fillRect(0, 0, width, height);

    const valueGradient = ctx.createLinearGradient(0, 0, 0, height);

    valueGradient.addColorStop(0, 'rgba(0,0,0,0)');
    valueGradient.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = valueGradient;
    ctx.fillRect(0, 0, width, height);
  }

  private positionSvThumb(): void {
    this._svThumb.style.left = `${this._state.hsv.s * 100}%`;
    this._svThumb.style.top = `${(1 - this._state.hsv.v) * 100}%`;
  }

  private updateAlphaSliderBackground(): void {
    // Inline `background-image` wins over the `.checker-track` class' CSS, so the checker
    // pattern is composited here in JS alongside the alpha gradient, not left to CSS alone.
    const { r, g, b } = this.currentRgb();

    this._alphaRange.style.backgroundImage = [
      `linear-gradient(to right, rgba(${r},${g},${b},0), rgba(${r},${g},${b},1))`,
      'linear-gradient(45deg, #2b2b2b 25%, transparent 25%)',
      'linear-gradient(-45deg, #2b2b2b 25%, transparent 25%)',
      'linear-gradient(45deg, transparent 75%, #2b2b2b 75%)',
      'linear-gradient(-45deg, transparent 75%, #2b2b2b 75%)',
    ].join(', ');
    this._alphaRange.style.backgroundSize = '100%, 10px 10px, 10px 10px, 10px 10px, 10px 10px';
    this._alphaRange.style.backgroundPosition = '0 0, 0 0, 0 5px, 5px -5px, -5px 0';
    this._alphaRange.style.backgroundColor = '#383838';
  }

  private syncColorFieldsFromHsv(): void {
    const { r, g, b } = this.currentRgb();

    this._hexInput.value = rgbToHex({ r, g, b });
    this._rInput.value = String(r);
    this._gInput.value = String(g);
    this._bInput.value = String(b);
    this.drawSvSquare();
    this.positionSvThumb();
    this.updateAlphaSliderBackground();
  }

  private syncControlsFromState(): void {
    this._hueRange.value = String(Math.round(this._state.hsv.h));
    this._hueNumber.value = String(Math.round(this._state.hsv.h));
    this._alphaRange.value = String(Math.round(this._state.alpha * 100));
    this._alphaNumber.value = String(Math.round(this._state.alpha * 100));

    this._colorToggle.checked = this._state.colorEnabled;
    this._styleToggle.checked = this._state.styleEnabled;
    this._colorPane.dataset.disabled = String(!this._state.colorEnabled);
    this._stylePane.dataset.disabled = String(!this._state.styleEnabled);
    this._styleTextarea.value = this._state.style;

    this.syncColorFieldsFromHsv();
    this.refreshPreview();
  }

  private refreshPreview(): void {
    const preset = this.buildPresetFromState();
    const resolved = resolveColorStyle(preset);

    this._resolvedCss.textContent = resolved
      ? `.word {\n  ${resolved.replace(/\n/g, '\n  ')}\n}`
      : '/* no rule — inherits page/userstyle */';

    const previewWord = createElement('span', { innerText: PREVIEW_SAMPLE.word });

    previewWord.setAttribute('style', resolved);

    this._previewStrip.replaceChildren(
      createElement('span', { class: 'context', innerText: PREVIEW_SAMPLE.before }),
      previewWord,
      createElement('span', { class: 'context', innerText: PREVIEW_SAMPLE.after }),
    );
  }

  private registerOverlayEvents(): void {
    this._colorToggle.addEventListener('change', () => {
      this._state.colorEnabled = this._colorToggle.checked;
      this._colorPane.dataset.disabled = String(!this._state.colorEnabled);
      this.refreshPreview();
    });

    this._styleToggle.addEventListener('change', () => {
      this._state.styleEnabled = this._styleToggle.checked;
      this._stylePane.dataset.disabled = String(!this._state.styleEnabled);
      this.refreshPreview();
    });

    const setSvFromEvent = (ev: MouseEvent): void => {
      const rect = this._svCanvas.parentElement!.getBoundingClientRect();
      const x = clamp(ev.clientX - rect.left, 0, rect.width);
      const y = clamp(ev.clientY - rect.top, 0, rect.height);

      this._state.hsv = { ...this._state.hsv, s: x / rect.width, v: 1 - y / rect.height };

      this.positionSvThumb();
      this.syncColorFieldsFromHsv();
      this.refreshPreview();
    };

    this._svCanvas.parentElement!.addEventListener('mousedown', (ev) => {
      this._svDragging = true;
      setSvFromEvent(ev);
    });
    window.addEventListener('mousemove', (ev) => {
      if (this._svDragging) {
        setSvFromEvent(ev);
      }
    });
    window.addEventListener('mouseup', () => {
      this._svDragging = false;
    });

    const applyHue = (h: number): void => {
      this._state.hsv = { ...this._state.hsv, h: clamp(h, 0, 360) };
      this._hueRange.value = String(this._state.hsv.h);
      this._hueNumber.value = String(this._state.hsv.h);
      this.syncColorFieldsFromHsv();
      this.refreshPreview();
    };

    this._hueRange.addEventListener('input', () => applyHue(Number(this._hueRange.value)));
    this._hueNumber.addEventListener('input', () => applyHue(Number(this._hueNumber.value) || 0));

    const applyAlpha = (percent: number): void => {
      this._state.alpha = clamp(percent, 0, 100) / 100;
      this._alphaRange.value = String(Math.round(this._state.alpha * 100));
      this._alphaNumber.value = String(Math.round(this._state.alpha * 100));
      this.refreshPreview();
    };

    this._alphaRange.addEventListener('input', () => applyAlpha(Number(this._alphaRange.value)));
    this._alphaNumber.addEventListener('input', () =>
      applyAlpha(Number(this._alphaNumber.value) || 0),
    );

    this._hexInput.addEventListener('change', () => {
      const parsed = parseHex(this._hexInput.value);

      if (!parsed) {
        this._hexInput.value = rgbToHex(this.currentRgb());

        return;
      }

      this._state.hsv = rgbToHsv(parsed);
      this._hueRange.value = String(Math.round(this._state.hsv.h));
      this._hueNumber.value = String(Math.round(this._state.hsv.h));
      this.syncColorFieldsFromHsv();
      this.refreshPreview();
    });

    const applyRgbInputs = (): void => {
      const r = clamp(Number(this._rInput.value) || 0, 0, 255);
      const g = clamp(Number(this._gInput.value) || 0, 0, 255);
      const b = clamp(Number(this._bInput.value) || 0, 0, 255);

      this._state.hsv = rgbToHsv({ r, g, b });
      this._hueRange.value = String(Math.round(this._state.hsv.h));
      this._hueNumber.value = String(Math.round(this._state.hsv.h));
      this.syncColorFieldsFromHsv();
      this.refreshPreview();
    };

    [this._rInput, this._gInput, this._bInput].forEach((input) =>
      input.addEventListener('change', applyRgbInputs),
    );

    this._styleTextarea.addEventListener('input', () => {
      this._state.style = this._styleTextarea.value;
      this.refreshPreview();
    });

    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && this._overlay?.classList.contains('is-open')) {
        this.closeOverlay();
      }
    });
  }

  //#endregion
}
