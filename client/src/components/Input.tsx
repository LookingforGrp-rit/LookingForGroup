import React, { useState, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

type InputType = 'single' | 'multi' | 'link';

interface CustomInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type: InputType;
  maxLength?: number;
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}

/**
 * Custom Input component
 * @param type - Single-line, multi-line, or link input. Defaults to single-line.
 * @param style - Optional custom styles for the input
 * @returns JSX.Element
 */
export const Input: React.FC<CustomInputProps> = ({
  type,
  style,
  onChange,
  ...props
}) => {

  // Multi-line input with character count
  if (type === 'multi') {
    // Keep track of value to change character count
    const [internalValue, setInternalValue] = useState('');
    const value = internalValue;

    // Handle prop changes
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) {
        onChange(e);
      }
      setInternalValue(e.target.value);
    };

    return (
      <div className="input-multiline-container" style={{ position: 'relative', height: '100%' }}>
        <span className="character-count">
          {value.length} / {props.maxLength}
        </span>
        <textarea
          className="input input-multiline"
          maxLength={props.maxLength}
          value={value}
          onChange={handleChange}
          {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      </div>
    );
  }

  // Link input with remove button
  if (type === 'link') {
    return (
      <div className="input-link-wrapper">
        <input
          type="text"
          placeholder="URL"
          className="input"
          onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
          {...props}
        />
        <button
          className='input-link-remove'
          title="Remove link"
        >
          <i className="fa-solid fa-minus"></i>
        </button>
      </div>
    )
  }

  // Standard Input (single line)
  return (
    <input
      className="input"
      onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
      {...props}
    />
  );
};
