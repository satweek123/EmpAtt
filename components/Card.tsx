
import React from 'react';

export const Card: React.FC<{ className?: string, children: React.ReactNode }> = ({ className, children }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm dark:bg-gray-800/50 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

export const CardHeader: React.FC<{ className?: string, children: React.ReactNode }> = ({ className, children }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

export const CardTitle: React.FC<{ className?: string, children: React.ReactNode }> = ({ className, children }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

export const CardContent: React.FC<{ className?: string, children: React.ReactNode }> = ({ className, children }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);
