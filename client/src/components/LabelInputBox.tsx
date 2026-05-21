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
  required?: boolean;
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
const LabelInputBox: React.FC<LabelInputBoxProps> = ({ label, labelInfo, inputType, maxLength, value, id, style, onChange, children, required=false }) => {

  return (
    <div className='label-input-box' id={id} style={style}>
      <label className="input-combo-label">
        {label}
        {required && (
          <span 
            className="required-asterisk" 
            aria-hidden="true" 
            title="Required"
          >
            *
          </span>
        )}
      </label>
      
      {labelInfo && <div className="label-info">{labelInfo}</div>}
      
      {inputType !== 'none' && (
        <Input 
          type={inputType} 
          maxLength={maxLength} 
          value={value} 
          onChange={onChange}
        />
      )}
      
      {children}
    </div>
  );
};

export default LabelInputBox;