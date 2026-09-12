import { ReactNode, createContext, useContext, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAutosave } from '@/hooks/use-autosave';

interface AutosaveProviderProps {
  children: ReactNode;
  onSave: (e?: React.FormEvent) => Promise<void>;
  enabled?: boolean;
  interval?: number;
}

interface AutosaveContextType {
  lastSaved: Date | null;
  saving: boolean;
}

const AutosaveContext = createContext<AutosaveContextType>({
  lastSaved: null,
  saving: false,
});

export const useAutosaveStatus = () => useContext(AutosaveContext);

export function AutosaveProvider({ 
  children, 
  onSave,
  enabled = true,
  interval = 30000 // 30 sekund
}: AutosaveProviderProps) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useAutosave({
    data: null, // Data se předávají přes onSave callback
    onSave: async () => {
      try {
        setSaving(true);
        await onSave();
        setLastSaved(new Date());
      } catch (error) {
        console.error('Chyba při automatickém ukládání:', error);
        toast({ 
          title: "Automatické ukládání selhalo",
          description: "Zkontrolujte připojení a zkuste to znovu",
          variant: "destructive"
        });
      } finally {
        setSaving(false);
      }
    },
    interval,
    enabled,
  });

  return (
    <AutosaveContext.Provider value={{ lastSaved, saving }}>
      {children}
    </AutosaveContext.Provider>
  );
}