// This component is used to create an array of string variables from user input
// Examples include tags and roles during project creation

import React, { useState } from 'react';
import { hardSkills } from '../constants/skills';

interface ItemMakerProps {
  type: 'role' | 'tag';
  grabber: (items: string[]) => void;
}

export const ItemMaker = ({ type, grabber }: ItemMakerProps) => {
  const [item, setItem] = useState('Full-stack Development');
  const [arr, setArr] = useState<string[]>([]);
 const [listObj, setObj] = useState<React.ReactElement>(<div></div>);

  // Determined by "type" to provide either text or dropdown
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

  // Deletes the item from the array, and then sets the object with the new array
  // Does not work properly, deletes multiple items at once
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