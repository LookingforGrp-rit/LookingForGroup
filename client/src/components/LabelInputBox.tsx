import React from 'react';
import { Input } from './Input';

interface LabelInputBoxProps {
  label: string;
  labelInfo?: string;
  inputType: 'single' | 'multi' | 'none';
  maxLength?: number;
  value?: string;
  initialValue?: string;
  id?: string;
  style?: React.CSSProperties;
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  children?: React.ReactNode;
  required?: boolean;
  forceUnsaved?: boolean;
  hideUnsaved?: boolean;
  placeholder?: string;
  htmlFor?: string;
  labelId?: string;
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
 * @param initialValue Optional value of the input box before any edits. Used to track unsaved
 * @param id Optional HTML id for the container div
 * @param style Optional CSS styles applied to the container div
 * @param onChange Optional change handler for input events
 * @param children Optional custom content to render inside the container
 * @param required Optional boolean to render a red asterisk next to the title
 * @param forceUnsaved Optional boolean to force the title to read "(Unsaved)"
 * @param hideUnsaved Optional boolean to hide the unsaved marker from showing
 * @param placeholder Optional boolean to have a placeholder value if there is no text in the field
 * @param htmlFor Optional value for the id of the element is that is being labelled
 * @param labelId Optional value for what id to use on the label
 * @returns A JSX element wrapping the label, input (if any), and children
 */
const LabelInputBox: React.FC<LabelInputBoxProps> = ({ 
  label, 
  labelInfo, 
  inputType, 
  maxLength, 
  value, 
  initialValue,
  id, 
  style, 
  onChange, 
  children, 
  required=false, 
  forceUnsaved=false,
  hideUnsaved=false,
  placeholder,
  htmlFor,
  labelId
}) => {
  // If the value is different than the start value
  const showUnsaved = forceUnsaved || value !== initialValue;

  return (
    <div className='label-input-box' id={id} style={style}>
      {hideUnsaved == false && (
        <label id={labelId} className="input-combo-label" htmlFor={htmlFor || undefined}>
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
        {showUnsaved && (
          <span className="unsaved-indicator">
            (Unsaved)
          </span>
        )}
      </label>
      )}
      
      {labelInfo && <div className="label-info">{labelInfo}</div>}
      
      {inputType !== 'none' && (
        <Input 
          id={htmlFor}
          type={inputType} 
          maxLength={maxLength} 
          value={value} 
          onChange={onChange}
          placeholder={placeholder}
        />
      )}
      
      {children}
    </div>
  );
};

export default LabelInputBox;