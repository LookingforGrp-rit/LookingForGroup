import React, { useState, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

type InputType = 'single' | 'multi' | 'link';

interface CustomInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type: InputType;
  maxLength?: number;
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onClick?: React.MouseEventHandler<HTMLElement>;
  placeholder?: string;
}

/**
 * Custom Input component
 * @param type - Single-line, multi-line, or link input. Defaults to single-line.
 * @param style - Optional custom styles for the input
 * @param onChange - Change event handler
 * @param onClick - Click event handler (for link type to handle removal)
 * @param placeholder - Optional placeholder text
 * @returns JSX.Element
 */
export const Input: React.FC<CustomInputProps> = ({
  type,
  onChange,
  onClick,
  placeholder,
  ...props
}) => {

  // Keep track of value to change character count (multi-line only)
  const [internalValue, setInternalValue] = useState(
    typeof (props.value) != "undefined" ? props.value : '');

  // Multi-line input with character count
  if (type === 'multi') {
    const value = internalValue;

    // Handle prop changes
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const trimmedValue = e.target.value
        // .replace(/ {2,}/g, " ")
        .replace(/ +$/g, " ")   // remove trailing spaces
        .replace(/^ +/g, "")   // remove leading spaces


      if (onChange) {
        onChange({
          ...e,
          target: { ...e.target, value: trimmedValue }
        });
      }

      setInternalValue(trimmedValue);
    };

    const charsLeft = (props.maxLength || 0) - value.toString().length;
    let className = 'character-count';
    if (charsLeft <= 30) className += ' character-count-near';
    if (charsLeft <= 20) className += ' character-count-close';
    if (charsLeft <= 10) className += ' character-count-danger';

    return (
      <div className="input-multiline-container" style={{ position: 'relative', height: '100%' }}>
        <span
          className={className}
        >
          {value.toString().length} / {props.maxLength}
        </span>
        <textarea
          className="input input-multiline"
          maxLength={props.maxLength}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      </div>
    );
  }

  // Standard Input
  const doSingleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const trimmedValue = e.target.value
      // .replace(/ {2,}/g, " ")
      .replace(/ +$/g, " ")
      .replace(/^ +/g, "");


    if (onChange) {
      onChange({
        ...e,
        target: { ...e.target, value: trimmedValue }
      });
    }
  };

  return (
    <input
      className="input"
      maxLength={props.maxLength}
      onChange={doSingleChange}
      placeholder={placeholder}
      {...props}
    />
  );
};
