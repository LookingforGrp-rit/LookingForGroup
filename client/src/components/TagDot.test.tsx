import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TagDot } from './TagDot';

describe('TagDot', () => {
  let container: HTMLDivElement;
  let root: Root;
  let touch: boolean;
  let cardClicks: number;

  // The dot sits inside a clickable card, like a profile or project card
  const render = (dot: React.ReactNode) =>
    act(() =>
      root.render(
        <MemoryRouter>
          <div onClick={() => cardClicks++}>{dot}</div>
        </MemoryRouter>,
      ),
    );
  const wraps = () => [...container.querySelectorAll('.tag-dot-wrap')] as HTMLElement[];
  const wrap = () => wraps()[0];
  const isOpen = (el: HTMLElement) => el.classList.contains('tag-dot-open');
  const click = (el: HTMLElement = wrap()) =>
    act(() => el.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  // jsdom has no PointerEvent, so a mouse event stands in with a pointer type. React builds
  // its pointerenter/pointerleave from pointerover/pointerout.
  const pointer = (type: 'pointerover' | 'pointerout', el: HTMLElement) =>
    act(() => {
      const event = new MouseEvent(type, { bubbles: true });
      Object.defineProperty(event, 'pointerType', { value: 'mouse' });
      el.dispatchEvent(event);
    });
  const hover = (el: HTMLElement = wrap()) => pointer('pointerover', el);
  const unhover = (el: HTMLElement = wrap()) => pointer('pointerout', el);
  const pressElsewhere = () =>
    act(() => {
      document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    });

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    touch = false;
    cardClicks = 0;
    // "(hover: none)" is what tells a touch screen from a mouse when a click has no pointer type
    vi.stubGlobal('matchMedia', () => ({ matches: touch }));
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  describe('on its own (project cards)', () => {
    it('starts closed', () => {
      render(<TagDot type="developer" label="React" projectId={1} />);

      expect(isOpen(wrap())).toBe(false);
    });

    it('colors the dot from the type', () => {
      render(<TagDot type="designer" label="Figma" />);

      expect(container.querySelector('.tag-dot')?.classList.contains('tag-red')).toBe(true);
    });

    it('opens on mouse hover and closes when the mouse leaves', () => {
      render(<TagDot type="developer" label="React" projectId={1} />);

      hover();
      expect(isOpen(wrap())).toBe(true);

      unhover();
      expect(isOpen(wrap())).toBe(false);
    });

    it('a tap opens it, and a tap elsewhere closes it', () => {
      touch = true;
      render(<TagDot type="developer" label="React" projectId={1} />);

      click();
      expect(isOpen(wrap())).toBe(true);

      pressElsewhere();
      expect(isOpen(wrap())).toBe(false);
    });

    it('a mouse click is left for the rest of the page to see', () => {
      render(<TagDot type="developer" label="React" projectId={1} />);

      click();

      expect(cardClicks).toBe(1);
    });
  });

  describe('controlled by its parent (skills on profile cards)', () => {
    // Three skills where exactly one is open, like the profile card
    const Skills = ({ onChange }: { onChange?: (index: number) => void }) => {
      const [selected, setSelected] = useState(0);
      return (
        <>
          {['A', 'B', 'C'].map((label, index) => (
            <TagDot
              key={label}
              type="developer"
              label={label}
              inline
              open={selected === index}
              onSelect={() => {
                setSelected(index);
                onChange?.(index);
              }}
            />
          ))}
        </>
      );
    };
    const openLabels = () => wraps().filter(isOpen).map((el) => el.textContent);

    it('shows the open state it is given', () => {
      render(<TagDot type="soft" label="Teamwork" inline open />);

      expect(isOpen(wrap())).toBe(true);
      expect(wrap().classList.contains('tag-dot-inline')).toBe(true);
    });

    it('starts with the first skill open', () => {
      render(<Skills />);

      expect(openLabels()).toStrictEqual(['A']);
    });

    it('clicking another skill switches to it, so one is always open', () => {
      render(<Skills />);

      click(wraps()[2]);
      expect(openLabels()).toStrictEqual(['C']);

      click(wraps()[1]);
      expect(openLabels()).toStrictEqual(['B']);
    });

    it('clicking the open skill does not close it', () => {
      render(<Skills />);

      click(wraps()[0]);
      click(wraps()[0]);

      expect(openLabels()).toStrictEqual(['A']);
    });

    it('works the same for a tap on a touch screen', () => {
      touch = true;
      render(<Skills />);

      click(wraps()[1]);
      click(wraps()[1]);

      expect(openLabels()).toStrictEqual(['B']);
    });

    it('pressing elsewhere does not close the open skill', () => {
      render(<Skills />);

      pressElsewhere();

      expect(openLabels()).toStrictEqual(['A']);
    });

    it('hovering does not open another skill', () => {
      render(<Skills />);

      hover(wraps()[2]);

      expect(openLabels()).toStrictEqual(['A']);
    });

    it('reports the click to the parent without opening the card around it', () => {
      const onChange = vi.fn();
      render(<Skills onChange={onChange} />);

      click(wraps()[1]);

      expect(onChange).toHaveBeenCalledWith(1);
      expect(cardClicks).toBe(0);
    });
  });
});
