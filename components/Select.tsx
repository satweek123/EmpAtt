
import React from 'react';
import { Calendar } from 'lucide-react';

// Enhanced context to share children between components
const SelectContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}>({ value: '', onValueChange: () => {}, children: null });

export const Select: React.FC<{
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
}> = ({ children, value, onValueChange }) => {
  return (
    <SelectContext.Provider value={{ value, onValueChange, children }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
};

export const SelectContent: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
    // This component acts as a data container for its children (SelectItems).
    // It should not render anything itself. Its children are accessed by the SelectTrigger.
    return null;
};

export const SelectTrigger: React.FC<{ id?: string, children: React.ReactNode; className?: string, hasIcon?: boolean }> = ({
  id,
  className,
  hasIcon,
}) => {
  const { value, onValueChange, children: selectChildren } = React.useContext(SelectContext);

  // Helper to find the SelectContent component among the Select's children
  const findSelectContent = (nodes: React.ReactNode): React.ReactElement<{ children: React.ReactNode }> | null => {
    let content: React.ReactElement<{ children: React.ReactNode }> | null = null;
    React.Children.forEach(nodes, (child) => {
      if (React.isValidElement<{ children: React.ReactNode }>(child) && child.type === SelectContent) {
        content = child;
      }
    });
    return content;
  };

  const selectContent = findSelectContent(selectChildren);

  // Memo to calculate the visible label from the selected value
  const selectedLabel = React.useMemo(() => {
    let label = '';
    if (selectContent) {
      React.Children.forEach(selectContent.props.children, (option) => {
        if (React.isValidElement<{ value: string; children: React.ReactNode }>(option) && option.props.value === value) {
          label = option.props.children as string;
        }
      });
    }
    return label;
  }, [value, selectContent]);

  const paddingClass = hasIcon ? 'pl-9 pr-3' : 'px-3';

  return (
    <div className={`relative ${className}`}>
      {hasIcon && <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />}
      <select
        id={id}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      >
        <option value="" disabled>{selectedLabel ? '' : 'Select...'}</option>
        {selectContent ? selectContent.props.children : null}
      </select>
      <div className={`flex h-10 items-center justify-between rounded-md border border-input bg-transparent py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${paddingClass}`}>
        <span className="font-semibold">{selectedLabel || 'Select...'}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 opacity-50"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </div>
  );
};


export const SelectValue: React.FC = () => {
    // This component is a placeholder for composition; its logic is handled in SelectTrigger.
    return null;
};

export const SelectItem: React.FC<{ value: string; children: React.ReactNode; }> = ({ value, children }) => {
  return <option value={value} className="bg-primary text-primary-foreground">{children}</option>;
};
