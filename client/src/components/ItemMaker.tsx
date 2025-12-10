// This component is used to create an array of string variables from user input
// Examples include tags and roles during project creation

import React, { useState } from 'react';
import { hardSkills } from '../constants/skills';

interface ItemMakerProps {
  // Determines input mode for either dropdown selection or freeform text input
  type: 'role' | 'tag';
  // Callback that receives the current array of items whenever it changes
  grabber: (items: string[]) => void;
}

/**
 * Creates and manages a dynamic list of string items from user input.
 * Can handle either predefined roles (dropdown) or freeform tags (text input).
 * 
 * @param type Determines input mode: 'role' for dropdown selection, 'tag' for freeform text
 * @param grabber Callback function that receives the updated array of items whenever it changes
 * @returns A JSX element containing the input, Add/Clear buttons, and the current list of items
 */
export const ItemMaker = ({ type, grabber }: ItemMakerProps) => {
  // Currently selected item in the input 
  const [item, setItem] = useState('Full-stack Development');
  // Array of added string items
  const [arr, setArr] = useState<string[]>([]);
  // JSX element displaying the list of items; rebuilt on every add/delete
 const [listObj, setObj] = useState<React.ReactElement>(<div></div>);

  /**
   * Generates the input element depending on the type:
   * - 'role': dropdown populated from `hardSkills`
   * - 'tag': freeform text input
   * Updates `item` state on change.
   */
   const createInput = () => {
    if (type === 'role') {
      return (
        <select
          onChange={(e) => {
            setItem(e.target.value);
          }}
          id="e-maker-select"
        >
          {hardSkills.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      );
    } else {
      return (
        <input
          type="text"
          onChange={(e) => {
            setItem(e.target.value);
          }}
          id="e-maker-text"
        />
      );
    }
  };

  /**
   * Removes the target item from the array and rebuilds the JSX list.
   * If multiple entries have the same string, all will be removed.
   *
   * @param targetItem The item string to remove
   */
   const deleteItem = (targetItem: string) => {
    const filtered = arr.filter((i) => i !== targetItem);
    setArr(filtered);
    setObj(
      <div>
        {filtered.map((i) => (
          <p key={i} onClick={() => deleteItem(i)}>
            {i}
          </p>
        ))}
      </div>
    );
  };

 return (
    <div>
      <div>{listObj}</div>
      {createInput()}
      <button
        onClick={() => {
          const updated = [...arr, item];
          setArr(updated);
          grabber(updated);
          setObj(
            <div>
              {updated.map((i) => (
                <p key={i} onClick={() => deleteItem(i)}>
                  {i}
                </p>
              ))}
            </div>
          );
        }}
        className="orange-button"
      >
        Add
      </button>
      <button
        onClick={() => {
          setArr([]);
          setObj(<div></div>);
        }}
        className="white-button"
      >
        Clear
      </button>
    </div>
  );
};