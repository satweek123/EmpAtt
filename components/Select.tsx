
import React from 'react';

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

export const SelectTrigger: React.FC<{ id?: string, children: React.ReactNode; className?: string }> = ({
  id,
  className,
}) => {
  const { value, onValueChange, children: selectChildren } = React.useContext(SelectContext);

  // Helper to find the SelectContent component among the Select's children
  const findSelectContent = (nodes: React.ReactNode): React.ReactElement | null => {
    let content: React.ReactElement | null = null;
    React.Children.forEach(nodes, (child) => {
      if (React.isValidElement(child) && child.type === SelectContent) {
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
        if (React.isValidElement(option) && option.props.value === value) {
          label = option.props.children as string;
        }
      });
    }
    return label;
  }, [value, selectContent]);

  return (
    <div className={`relative ${className}`}>
      <select
        id={id}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      >
        {selectContent ? selectContent.props.children : null}
      </select>
      <div className="flex h-10 items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600">
        {selectedLabel || <span className="text-muted-foreground">Select...</span>}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 opacity-50"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </div>
  );
};


export const SelectValue: React.FC = () => {
    // This component is a placeholder for composition; its logic is handled in SelectTrigger.
    return null;
};

export const SelectContent: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
    // This component acts as a data container for its children (SelectItems).
    // It does not render anything itself.
    return <>{children}</>;
};

export const SelectItem: React.FC<{ value: string; children: React.ReactNode; }> = ({ value, children }) => {
  return <option value={value}>{children}</option>;
};
