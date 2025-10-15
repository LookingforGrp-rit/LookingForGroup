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