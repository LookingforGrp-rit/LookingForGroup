import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { findFittingSize, useFitText } from './useFitText';

describe('findFittingSize', () => {
  // Text that is `width` px wide at 1px of font size
  const fitsIn = (room: number, width: number) => (size: number) => size * width <= room;

  it('keeps the biggest size when the text already fits', () => {
    expect(findFittingSize(fitsIn(100, 4), 20, 10)).toBe(20);
  });

  it('shrinks to the biggest size that fits', () => {
    // fits up to 100 / 8 = 12.5px
    const size = findFittingSize(fitsIn(100, 8), 20, 10);

    expect(size).toBeLessThanOrEqual(12.5);
    expect(size).toBeGreaterThan(12.5 - 0.25);
  });

  it('stops at the minimum when the text never fits', () => {
    expect(findFittingSize(fitsIn(100, 50), 20, 10)).toBe(10);
  });

  it('does not test sizes outside the allowed range', () => {
    const tried: number[] = [];
    findFittingSize(
      (size) => {
        tried.push(size);
        return size <= 14;
      },
      20,
      10,
    );

    expect(Math.min(...tried)).toBeGreaterThanOrEqual(10);
    expect(Math.max(...tried)).toBeLessThanOrEqual(20);
  });
});

describe('useFitText', () => {
  const BASE_SIZE = 20;
  const ROOM = 100;
  let container: HTMLDivElement;
  let root: Root;
  let style: HTMLStyleElement;
  let phone: boolean;
  const mediaListeners = new Set<() => void>();

  // jsdom has no layout, so pretend the text is half a font-size wide per letter
  const inlineSize = (el: HTMLElement) => parseFloat(el.style.fontSize) || BASE_SIZE;
  const Title = ({ text }: { text: string }) => {
    const ref = useFitText<HTMLHeadingElement>(text);
    return (
      <h2 ref={ref} className="title">
        {text}
      </h2>
    );
  };

  const render = (text: string) => act(() => root.render(<Title text={text} />));
  const shownSize = () => parseFloat(container.querySelector('h2')?.style.fontSize ?? '');

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    phone = true;
    mediaListeners.clear();

    vi.stubGlobal('matchMedia', () => ({
      get matches() {
        return phone;
      },
      addEventListener: (_: string, listener: () => void) => mediaListeners.add(listener),
      removeEventListener: (_: string, listener: () => void) => mediaListeners.delete(listener),
    }));
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      return (this.textContent?.length ?? 0) * inlineSize(this) * 0.5;
    });
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(ROOM);

    style = document.createElement('style');
    style.textContent = `.title { font-size: ${BASE_SIZE.toString()}px; }`;
    document.head.appendChild(style);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    style.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('leaves a short title at its normal size', () => {
    render('Short'); // 5 letters: 50px wide at 20px

    expect(shownSize()).toBe(BASE_SIZE);
  });

  it('shrinks a long title until it fits on the line', () => {
    render('A'.repeat(14)); // 140px wide at 20px, so about 14px is the biggest that fits

    expect(shownSize()).toBeLessThan(BASE_SIZE);
    expect(14 * shownSize() * 0.5).toBeLessThanOrEqual(ROOM);
  });

  it('does not go below the minimum size', () => {
    render('A'.repeat(500)); // never fits

    expect(shownSize()).toBe(0.8 * 16);
  });

  it('fits again when the title changes', () => {
    render('A'.repeat(14));
    const shrunk = shownSize();

    render('Short');

    expect(shownSize()).toBeGreaterThan(shrunk);
  });

  it('puts the normal size back when the screen stops being a phone', () => {
    render('A'.repeat(14));
    expect(container.querySelector('h2')?.style.fontSize).not.toBe('');

    phone = false;
    act(() => mediaListeners.forEach((listener) => listener()));

    expect(container.querySelector('h2')?.style.fontSize).toBe('');
  });

  it('does nothing on a screen that is not a phone', () => {
    phone = false;
    render('A'.repeat(14));

    expect(container.querySelector('h2')?.style.fontSize).toBe('');
  });
});
