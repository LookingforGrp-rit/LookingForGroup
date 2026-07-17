import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Select, SelectButton, SelectOptions } from './Select';

describe('Select', () => {
  // @ts-expect-error - React 19 test environment flag
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('keeps the searchable dropdown open when space is pressed in the search input', () => {
    act(() => {
      root.render(
        <Select>
          <SelectButton placeholder="Choose a major" type="input" searchable />
          <SelectOptions
            options={[
              { markup: <span>Computer Science</span>, value: 'Computer Science', disabled: false },
            ]}
          />
        </Select>
      );
    });

    const trigger = container.querySelector('.select.select-button-input') as HTMLElement;
    expect(trigger).not.toBeNull();

    act(() => {
      trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const input = container.querySelector('.select-search-input') as HTMLInputElement;
    expect(input).not.toBeNull();

    act(() => {
      input.focus();
      input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: ' ' }));
    });

    expect(container.querySelector('.select-options')).not.toBeNull();
  });
});
