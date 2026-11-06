import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import usePreloadedImage from './imageLoad';

// Stand-in for the browser's Image so each test decides when (and how) a load finishes
class FakeImage {
  static instances: FakeImage[] = [];
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = '';

  constructor() {
    FakeImage.instances.push(this);
  }
}

const PLACEHOLDER = 'placeholder.png';

const Probe = ({ src }: { src: string }) => <img src={usePreloadedImage(src, PLACEHOLDER)} />;

describe('usePreloadedImage', () => {
  let container: HTMLDivElement;
  let root: Root;

  const render = (src: string) => act(() => root.render(<Probe src={src} />));
  const shownSrc = () => container.querySelector('img')?.getAttribute('src');

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    FakeImage.instances = [];
    vi.stubGlobal('Image', FakeImage);
    vi.spyOn(window, 'Image', 'get').mockReturnValue(FakeImage as unknown as typeof Image);
    container = document.createElement('div');
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('shows the placeholder until the real image has loaded', () => {
    render('real.png');
    expect(shownSrc()).toBe(PLACEHOLDER);

    act(() => FakeImage.instances[0].onload?.());
    expect(shownSrc()).toBe('real.png');
  });

  it('stays on the placeholder when the image fails to load', () => {
    render('broken.png');
    act(() => FakeImage.instances[0].onerror?.());

    expect(shownSrc()).toBe(PLACEHOLDER);
  });

  it('does not request a source that is still "undefined" or "null"', () => {
    render('undefined');
    render('null');
    render('');

    expect(FakeImage.instances).toHaveLength(0);
    expect(shownSrc()).toBe(PLACEHOLDER);
  });

  it('loads the real image once it arrives after an unloaded one', () => {
    render('undefined');
    render('real.png');
    act(() => FakeImage.instances[0].onload?.());

    expect(shownSrc()).toBe('real.png');
  });

  it('ignores a failure from an old source that arrives after the new one loaded', () => {
    render('old.png');
    const lateOldFailure = FakeImage.instances[0].onerror;

    render('new.png');
    act(() => FakeImage.instances[1].onload?.());
    expect(shownSrc()).toBe('new.png');

    // The old request finally fails; it must not put the placeholder back
    act(() => lateOldFailure?.());
    expect(shownSrc()).toBe('new.png');
  });

  it('ignores a success from an old source that arrives after the placeholder was chosen', () => {
    render('old.png');
    const lateOldLoad = FakeImage.instances[0].onload;

    render('undefined');
    act(() => lateOldLoad?.());

    expect(shownSrc()).toBe(PLACEHOLDER);
  });
});
