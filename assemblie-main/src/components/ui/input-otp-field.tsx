
import React, { useState } from 'react';
import { Input } from './input';

interface InputOTPFieldProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  disabled?: boolean;
}

export function InputOTPField({ value, onChange, maxLength = 6, disabled = false }: InputOTPFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Only allow digits
    if (/^\d*$/.test(newValue) && newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <Input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={maxLength}
        value={value}
        onChange={handleChange}
        className="text-center text-lg tracking-widest"
        placeholder="Enter verification code"
        disabled={disabled}
      />
      <div className="flex justify-center mt-2 space-x-1">
        {Array.from({ length: maxLength }).map((_, i) => (
          <div 
            key={i}
            className={`w-4 h-1 rounded-full ${
              i < value.length ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
