import React from 'react';
import { EraType } from '../../types/movie';
import { Calendar } from 'lucide-react';

interface EraOptionItem {
  id: EraType;
  label: string;
  sublabel: string;
}

const ERAS: EraOptionItem[] = [
  { id: 'classic', label: 'Classic', sublabel: 'Pre-2000s golden era' },
  { id: '2000-2010', label: '2000–2010', sublabel: 'Turn of the millennium' },
  { id: '2010-2020', label: '2010–2020', sublabel: 'Modern favorites' },
  { id: 'recent', label: 'Recent', sublabel: '2020 to present' },
];

interface EraSelectorProps {
  selectedEra?: EraType;
  onChange: (era?: EraType) => void;
}

export const EraSelector: React.FC<EraSelectorProps> = ({ selectedEra, onChange }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>3. Era</span>
        </label>
        {selectedEra && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-xs text-slate-400 hover:text-amber-400 transition-colors"
          >
            Any era
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ERAS.map((era) => {
          const isSelected = selectedEra === era.id;
          return (
            <button
              key={era.id}
              type="button"
              onClick={() => onChange(isSelected ? undefined : era.id)}
              className={`flex flex-col p-3.5 rounded-2xl border text-left transition-all duration-200 ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-500 shadow-glow text-white'
                  : 'bg-card border-border/70 hover:border-slate-600 text-slate-300 hover:bg-slate-800/40'
              }`}
            >
              <span className="font-bold text-sm tracking-wide text-slate-100">{era.label}</span>
              <span className="text-xs text-slate-400 mt-0.5">{era.sublabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

