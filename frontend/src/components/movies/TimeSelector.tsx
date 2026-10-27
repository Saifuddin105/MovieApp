import React from 'react';
import { RuntimeType } from '../../types/movie';
import { Clock } from 'lucide-react';

interface TimeOptionItem {
  id: RuntimeType;
  label: string;
  sublabel: string;
}

const TIMES: TimeOptionItem[] = [
  { id: 'under-90', label: 'Under 90 mins', sublabel: 'Quick & punchy' },
  { id: '90-120', label: '90–120 mins', sublabel: 'Standard feature film' },
  { id: 'over-120', label: '2+ hours', sublabel: 'Epic & immersive' },
];

interface TimeSelectorProps {
  selectedTime?: RuntimeType;
  onChange: (time?: RuntimeType) => void;
}

export const TimeSelector: React.FC<TimeSelectorProps> = ({ selectedTime, onChange }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>2. Time Available</span>
        </label>
        {selectedTime && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-xs text-slate-400 hover:text-amber-400 transition-colors"
          >
            Any duration
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TIMES.map((time) => {
          const isSelected = selectedTime === time.id;
          return (
            <button
              key={time.id}
              type="button"
              onClick={() => onChange(isSelected ? undefined : time.id)}
              className={`flex flex-col p-3.5 rounded-2xl border text-left transition-all duration-200 ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-500 shadow-glow text-white'
                  : 'bg-card border-border/70 hover:border-slate-600 text-slate-300 hover:bg-slate-800/40'
              }`}
            >
              <span className="font-bold text-sm tracking-wide text-slate-100">{time.label}</span>
              <span className="text-xs text-slate-400 mt-0.5">{time.sublabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

