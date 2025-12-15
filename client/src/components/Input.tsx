import React, { useState, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

type InputType = 'single' | 'multi' | 'link';

interface CustomInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type: InputType;
  maxLength?: number;
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

/**
 * Custom Input component
 * @param type - Single-line, multi-line, or link input. Defaults to single-line.
 * @param style - Optional custom styles for the input
 * @param onChange - Change event handler
 * @param onClick - Click event handler (for link type to handle removal)
 * @returns JSX.Element
 */
export const Input: React.FC<CustomInputProps> = ({
  type,
  onChange,
  onClick,
  ...props
}) => {

  
  // Keep track of value to change character count (multi-line only)
  const [internalValue, setInternalValue] = useState('');

  // Multi-line input with character count
  if (type === 'multi') {
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
          type="url"
          placeholder="URL"
          className="input"
          onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
          {...props}
        />
        <button
          className='input-link-remove'
          title="Remove link"
          onClick={(e) => {
            onClick?.(e);
          }}
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
