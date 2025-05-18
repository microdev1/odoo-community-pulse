'use client';

import * as React from 'react';

type TabsProps = {
  defaultValue: string;
  children: React.ReactNode;
};

type TabsContentProps = {
  value: string;
  children: React.ReactNode;
};

type TabsTriggerProps = {
  value: string;
  children: React.ReactNode;
};

// Create a React context to manage tab state
const TabsContext = React.createContext<{
  value: string;
  setValue: (value: string) => void;
}>({
  value: '',
  setValue: () => {},
});

export function Tabs({ defaultValue, children }: TabsProps) {
  const [value, setValue] = React.useState(defaultValue);

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className="tabs-container">{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex space-x-1 rounded-xl bg-gray-100 p-1">
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children }: TabsTriggerProps) {
  const { value: selectedValue, setValue } = React.useContext(TabsContext);
  const isSelected = selectedValue === value;

  return (
    <button
      className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors
        ${isSelected ? 'bg-white shadow text-green-600' : 'text-gray-700 hover:bg-gray-50'}`}
      onClick={() => setValue(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children }: TabsContentProps) {
  const { value: selectedValue } = React.useContext(TabsContext);

  if (value !== selectedValue) {
    return null;
  }

  return <div>{children}</div>;
}
