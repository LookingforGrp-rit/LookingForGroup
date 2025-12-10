import React from 'react';
import { Input } from './Input';

interface LabelInputBoxProps {
  label: string;
  labelInfo?: string;
  inputType: 'single' | 'multi' | 'none';
  maxLength?: number;
  value?: string;
  id?: string;
  style?: React.CSSProperties;
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  children?: React.ReactNode;
}

/**
 * A container component that pairs a label with an input element or custom content.
 * Supports single-line, multi-line, or no input.
 * 
 * @param label The main label text displayed above the input or content
 * @param labelInfo Optional additional info displayed under the label
 * @param inputType Determines the type of input: 'single', 'multi', or 'none'
 * @param maxLength Maximum character length for multi-line input (optional)
 * @param value Controlled value of the input (optional)
 * @param id Optional HTML id for the container div
 * @param style Optional CSS styles applied to the container div
 * @param onChange Optional change handler for input events
 * @param children Optional custom content to render inside the container
 * @returns A JSX element wrapping the label, input (if any), and children
 */
const LabelInputBox: React.FC<LabelInputBoxProps> = ({ label, labelInfo, inputType, maxLength, value, id, style, onChange, children }) => {

  // Multi-line input
  if (inputType === 'multi') {
    return (
      <div className='label-input-box' id={id} style={style}>
        <label className="input-combo-label">
          {label}
        </label>
        {labelInfo && <div className="label-info">{labelInfo}</div>}
        <Input type="multi" maxLength={maxLength} value={value} onChange={onChange} />
        {children}
      </div>
    )
  }

  // No input (input likely in children)
  if (inputType === 'none') {
    return (
      <div className='label-input-box' id={id} style={style}>
        <label className="input-combo-label">
          {label}
        </label>
        {labelInfo && <div className="label-info">{labelInfo}</div>}
        {children}
      </div>
    )
  }

  // Single-line input (default)
  return (
    <div className='label-input-box' id={id} style={style}>
      <label className="input-combo-label">
        {label}
      </label>
      {labelInfo && <div className="label-info">{labelInfo}</div>}
      <Input type="single" value={value} onChange={onChange} />
      {children}
    </div>
  );
};

export default LabelInputBox;