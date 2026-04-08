import { useState } from "react";

interface ToggleSwitchProps {
  label?: string;
  enabled?: boolean;
  onChange?: (enabled: boolean) => void;
  disabled?: boolean;
}

const ToggleSwitch = ({ 
  label, 
  enabled = false, 
  onChange,
  disabled = false 
}: ToggleSwitchProps) => {
  const [isEnabled, setIsEnabled] = useState(enabled);

  const handleToggle = () => {
    if (disabled) return;
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    onChange?.(newValue);
  };

  return (
    <div className="flex items-center gap-3">
    
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full
          transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10B981]
          ${isEnabled ? 'bg-[#10B981]' : 'bg-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        aria-checked={isEnabled}
        role="switch"
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white
            transition-transform duration-200 ease-in-out
            ${isEnabled ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>

    </div>
  );
};

export default ToggleSwitch;