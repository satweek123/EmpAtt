

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from "./components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/Card";
import { Input } from "./components/Input";
import { Label } from "./components/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/Tabs";
import { ConfirmationDialog } from './components/ConfirmationDialog';
import {
  Plus,
  Edit,
  Trash,
  Calendar,
  Users,
  Check,
  X,
  IndianRupee,
  Loader2,
  AlertCircle,
  Moon,
  Sun
} from "lucide-react";
import {
  Employee,
  DailyRecords,
  AttendanceStatus,
  DailyRecord,
  EmployeeMonthlyStats,
  getLocalDateString,
  calculateEmployeeMonthlyStats
} from './types';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const SaveStatusIndicator: React.FC<{ status: SaveStatus }> = ({ status }) => {
  const statusConfig = {
    saving: {
      text: 'Saving...',
      icon: <Loader2 className="h-4 w-4 animate-spin text-muted-foreground dark:text-dark-muted-foreground" />,
      color: 'text-muted-foreground dark:text-dark-muted-foreground',
    },
    saved: {
      text: 'Saved',
      icon: <Check className="h-4 w-4 text-green-600" />,
      color: 'text-green-600',
    },
    error: {
      text: 'Error saving',
      icon: <AlertCircle className="h-4 w-4 text-red-600" />,
      color: 'text-red-600',
    },
  };

  const isIdle = status === 'idle';
  const currentStatus = isIdle ? null : statusConfig[status];

  return (
    <div className={`flex items-center justify-end gap-2 text-sm font-medium transition-opacity duration-300 w-24 h-5 ${isIdle ? 'opacity-0' : 'opacity-100'} ${currentStatus?.color || ''}`}>
      {currentStatus && (
        <>
          {currentStatus.icon}
          <span>{currentStatus.text}</span>
        </>
      )}
    </div>
  );
};


const EmployeeAttendanceTracker: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dailyRecords, setDailyRecords] = useState<DailyRecords>({});
  const [currentDate, setCurrentDate] = useState<string>(getLocalDateString(new Date()));
  const [selectedMonth, setSelectedMonth] = useState<string>(getLocalDateString(new Date()).slice(0, 7));
  const [showEmployeeForm, setShowEmployeeForm] = useState<boolean>(false);
  const [newEmployee, setNewEmployee] = useState<Omit<Employee, 'id'>>({ name: '', phone: '' });
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [editEmployeeData, setEditEmployeeData] = useState<Employee>({ id: '', name: '', phone: '' });
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [formError, setFormError] = useState<string | null>(null);

  const today = useMemo(() => getLocalDateString(new Date()), []);
  const isInitialMount = useRef(true);
  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    try {
      const savedEmployees = localStorage.getItem('employees');
      const savedRecords = localStorage.getItem('dailyRecords');

      if (savedEmployees) setEmployees(JSON.parse(savedEmployees));
      if (savedRecords) {
          const parsedRecords = JSON.parse(savedRecords);
          setDailyRecords(parsedRecords);
          const monthKeys = Object.keys(parsedRecords);
          if (monthKeys.length > 0) {
              const mostRecentMonth = monthKeys.map(key => key.slice(0, 7)).sort().reverse()[0];
              if (mostRecentMonth) {
                  setSelectedMonth(mostRecentMonth);
              }
          }
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
    }
    
    if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus('saving');

    const saveDebounce = setTimeout(() => {
        try {
            localStorage.setItem('employees', JSON.stringify(employees));
            localStorage.setItem('dailyRecords', JSON.stringify(dailyRecords));
            setSaveStatus('saved');

            saveTimeoutRef.current = window.setTimeout(() => {
                setSaveStatus('idle');
            }, 2000);

        } catch (error) {
            console.error("Failed to save data to localStorage", error);
            setSaveStatus('error');
        }
    }, 500);

    return () => {
        clearTimeout(saveDebounce);
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
    };
  }, [employees, dailyRecords]);

  const addEmployee = () => {
    if (!newEmployee.name.trim()) {
      setFormError("Employee name cannot be empty.");
      return;
    }
    setFormError(null);
    const employee: Employee = { id: Date.now().toString(), ...newEmployee };
    setEmployees([...employees, employee]);
    setNewEmployee({ name: '', phone: '' });
    setShowEmployeeForm(false);
  };

  const startEditEmployee = (employee: Employee) => {
    setEditingEmployeeId(employee.id);
    setEditEmployeeData(employee);
    setFormError(null);
    setShowEmployeeForm(true);
  };

  const saveEditEmployee = () => {
    if (!editEmployeeData.name.trim()) {
      setFormError("Employee name cannot be empty.");
      return;
    }
    setFormError(null);
    setEmployees(employees.map(emp => emp.id === editingEmployeeId ? editEmployeeData : emp));
    setEditingEmployeeId(null);
    setShowEmployeeForm(false);
  };

  const confirmDeleteEmployee = () => {
    if (!employeeToDelete) return;

    const id = employeeToDelete.id;
    setEmployees(currentEmployees => currentEmployees.filter(employee => employee.id !== id));
    setDailyRecords(currentRecords => {
      const newRecords = { ...currentRecords };
      Object.keys(newRecords).forEach(date => {
        const filteredRecords = newRecords[date].filter(record => record.employeeId !== id);
        if (filteredRecords.length > 0) {
          newRecords[date] = filteredRecords;
        } else {
          delete newRecords[date];
        }
      });
      return newRecords;
    });
    setEmployeeToDelete(null);
  };

  const getEmployeeRecord = (employeeId: string): DailyRecord | undefined => {
    const records = dailyRecords[currentDate] || [];
    return records.find(record => record.employeeId === employeeId);
  };

  const updateAttendance = (employeeId: string, status: AttendanceStatus) => {
    const records = dailyRecords[currentDate] || [];
    const existingIndex = records.findIndex(record => record.employeeId === employeeId);
    const newRecord: DailyRecord = {
      employeeId,
      status,
      payment: getEmployeeRecord(employeeId)?.payment || 0
    };

    if (existingIndex >= 0) {
      const updatedRecords = [...records];
      updatedRecords[existingIndex] = newRecord;
      setDailyRecords({ ...dailyRecords, [currentDate]: updatedRecords });
    } else {
      setDailyRecords({ ...dailyRecords, [currentDate]: [...records, newRecord] });
    }
  };

  const updatePayment = (employeeId: string, payment: number) => {
    const records = dailyRecords[currentDate] || [];
    const existingIndex = records.findIndex(record => record.employeeId === employeeId);
    const safePayment = Math.max(0, payment);

    if (existingIndex >= 0) {
      const updatedRecords = [...records];
      updatedRecords[existingIndex] = { ...updatedRecords[existingIndex], payment: safePayment };
      setDailyRecords({ ...dailyRecords, [currentDate]: updatedRecords });
    } else {
      setDailyRecords({
        ...dailyRecords,
        [currentDate]: [...records, { employeeId, status: 'present', payment: safePayment }]
      });
    }
  };

  const employeeStatsMap = useMemo(() => {
    const statsMap: Record<string, EmployeeMonthlyStats> = {};
    employees.forEach(employee => {
      statsMap[employee.id] = calculateEmployeeMonthlyStats(employee.id, dailyRecords, selectedMonth);
    });
    return statsMap;
  }, [employees, dailyRecords, selectedMonth]);

  const monthOptions = useMemo(() => {
    const monthSet = new Set<string>();
    Object.keys(dailyRecords).forEach(dateStr => {
      monthSet.add(dateStr.slice(0, 7)); 
    });
    monthSet.add(getLocalDateString(new Date()).slice(0, 7));
    const sortedMonths = Array.from(monthSet).sort().reverse();
    return sortedMonths.map(monthStr => {
      const [year, month] = monthStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      const label = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      return { value: monthStr, label };
    });
  }, [dailyRecords]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateWithDayName = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  const sortedEmployees = useMemo(() => 
    [...employees].sort((a, b) => a.name.localeCompare(b.name)),
    [employees]
  );
  
  const handleToggleForm = () => {
    setShowEmployeeForm(prev => !prev);
    setEditingEmployeeId(null);
    setNewEmployee({ name: '', phone: '' });
    setFormError(null);
  }

  return (
    <>
      <div className="min-h-screen bg-background text-foreground dark:bg-dark-background dark:text-dark-foreground transition-colors duration-300">
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
          <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b pb-4 border-border dark:border-dark-border">
            <div className="w-full md:w-auto">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-600 text-center md:text-left">Employee Attendance Tracker</h1>
              <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground text-center md:text-left">Manage daily attendance and monthly payroll with ease.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row w-full md:w-auto items-center gap-2">
              <div className="flex w-full sm:w-auto justify-center sm:justify-end items-center gap-2 mb-2 sm:mb-0">
                 <SaveStatusIndicator status={saveStatus} />
              </div>
              
              <div className="flex items-center gap-2 w-full justify-center sm:justify-end">
                <Button variant="outline" size="icon" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label="Toggle theme">
                    {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </Button>
                
                <Button onClick={handleToggleForm} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800 ml-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">{showEmployeeForm && !editingEmployeeId ? 'Hide Form' : 'Add Employee'}</span>
                  <span className="sm:hidden">{showEmployeeForm && !editingEmployeeId ? 'Hide' : 'Add'}</span>
                </Button>
              </div>
            </div>
          </header>

          {(showEmployeeForm || editingEmployeeId) && (
            <Card className="mb-8 shadow-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
              <CardHeader><CardTitle>{editingEmployeeId ? 'Edit Employee Details' : 'Add New Employee'}</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
                  <div className="md:col-span-1">
                    <Label htmlFor="name">Name*</Label>
                    <Input id="name" value={editingEmployeeId ? editEmployeeData.name : newEmployee.name} onChange={(e) => editingEmployeeId ? setEditEmployeeData({ ...editEmployeeData, name: e.target.value }) : setNewEmployee({ ...newEmployee, name: e.target.value })} placeholder="e.g. John Doe" />
                     {formError && <p className="text-red-500 text-sm mt-1">{formError}</p>}
                  </div>
                  <div className="md:col-span-1"><Label htmlFor="phone">Phone</Label><Input id="phone" value={editingEmployeeId ? editEmployeeData.phone : newEmployee.phone} onChange={(e) => editingEmployeeId ? setEditEmployeeData({ ...editEmployeeData, phone: e.target.value }) : setNewEmployee({ ...newEmployee, phone: e.target.value })} placeholder="e.g. 555-1234" type="tel" /></div>
                  <div className="md:col-span-1 lg:col-span-2 flex flex-col sm:flex-row items-end gap-2 w-full">
                    {editingEmployeeId ? (<><Button onClick={saveEditEmployee} className="w-full sm:w-auto flex-1 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800"><Check className="h-4 w-4 mr-2" />Save Changes</Button><Button variant="outline" onClick={() => { setEditingEmployeeId(null); setShowEmployeeForm(false); setFormError(null); }} className="w-full sm:w-auto flex-1"><X className="h-4 w-4 mr-2" />Cancel</Button></>) : (<Button onClick={addEmployee} className="w-full bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800"><Plus className="h-4 w-4 mr-2" />Add Employee</Button>)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="daily" className="w-full">
            <TabsList><TabsTrigger value="daily">Daily Tracking</TabsTrigger><TabsTrigger value="summary">Monthly Summary</TabsTrigger></TabsList>
            
            <TabsContent value="daily">
              <Card className="shadow-xl">
                <CardHeader>
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-center">
                      <CardTitle className="flex items-center justify-center gap-2">
                        <Calendar className="h-5 w-5 text-red-500" />
                        Daily Attendance
                      </CardTitle>
                      <p className="text-muted-foreground dark:text-dark-muted-foreground font-semibold">{formatDateWithDayName(currentDate)}</p>
                    </div>
                    
                    <div className="relative w-full sm:w-auto">
                      <div className="flex h-10 items-center justify-between rounded-md border border-input bg-background dark:border-dark-input dark:bg-dark-background px-3 text-sm ring-offset-background w-full sm:w-48 pointer-events-none">
                        <span className="font-semibold">{formatDate(currentDate)}</span>
                        <Calendar className="h-4 w-4 opacity-50 ml-2" />
                      </div>
                      <Input
                        id="date-picker-input"
                        type="date"
                        value={currentDate}
                        max={today}
                        onChange={(e) => e.target.value && setCurrentDate(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label={`Change attendance date. Current date is ${formatDate(currentDate)}.`}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {sortedEmployees.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg p-6 bg-gray-50 dark:bg-gray-900/50 border-gray-300 dark:border-gray-700">
                      <p className="text-muted-foreground dark:text-dark-muted-foreground mb-4">No employees found. Add one to start tracking!</p>
                      <Button onClick={handleToggleForm} className="bg-orange-500 hover:bg-orange-600 text-white"><Plus className="h-4 w-4 mr-2" />Add First Employee</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sortedEmployees.map(employee => {
                        const record = getEmployeeRecord(employee.id);
                        return (
                          <Card key={employee.id} className="p-4 border-l-4 border-blue-500 dark:border-blue-400 shadow-md transition-all hover:shadow-lg">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                              <div className="flex-1 flex items-center gap-3 min-w-40">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full"><Users className="h-6 w-6 text-blue-500 dark:text-blue-400" /></div>
                                <div>
                                  <h3 className="font-bold text-lg">{employee.name}</h3>
                                  <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground">{employee.phone}</p>
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-start sm:items-center">
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                  <Label htmlFor={`status-${employee.id}`} className="text-sm font-medium whitespace-nowrap">Status:</Label>
                                  <Select value={record?.status || 'absent'} onValueChange={(value) => updateAttendance(employee.id, value as AttendanceStatus)}>
                                    <SelectTrigger id={`status-${employee.id}`} className="w-full sm:w-32"><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="present">Present</SelectItem><SelectItem value="absent">Absent</SelectItem><SelectItem value="half-day">Half Day</SelectItem></SelectContent>
                                  </Select>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                  <Label htmlFor={`payment-${employee.id}`} className="text-sm font-medium">Payment: ₹</Label>
                                  <Input id={`payment-${employee.id}`} type="number" value={record?.payment || ''} onChange={(e) => updatePayment(employee.id, parseFloat(e.target.value) || 0)} className="w-full sm:w-24 text-right" placeholder="0.00" min="0" />
                                </div>
                                <div className="flex gap-1 mt-2 sm:mt-0 ml-auto">
                                  <Button variant="outline" size="icon" onClick={() => startEditEmployee(employee)} aria-label={`Edit ${employee.name}`}><Edit className="h-4 w-4 text-yellow-600 dark:text-yellow-400" /></Button>
                                  <Button variant="outline" size="icon" onClick={() => setEmployeeToDelete(employee)} aria-label={`Delete ${employee.name}`}><Trash className="h-4 w-4 text-red-600 dark:text-red-400" /></Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summary">
              <Card className="shadow-xl">
                <CardHeader>
                  <div className="flex flex-col items-center gap-4">
                    <CardTitle>Monthly Summary</CardTitle>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="w-full sm:w-48" hasIcon>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {monthOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedMonth ? (
                    <div className="space-y-4">
                      {sortedEmployees.length > 0 ? (
                        sortedEmployees.map(employee => {
                          const stats = employeeStatsMap[employee.id] || { present: 0, absent: 0, halfDay: 0, totalPayment: 0 };
                          return (
                            <Card key={employee.id} className="shadow-md hover:shadow-lg transition-shadow">
                              <CardHeader>
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full"><Users className="h-6 w-6 text-blue-500 dark:text-blue-400" /></div>
                                  <div>
                                    <CardTitle className="text-xl">{employee.name}</CardTitle>
                                    <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground">{employee.phone}</p>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left">
                                  <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/40">
                                    <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground flex items-center justify-center md:justify-start gap-1"><Check className="h-4 w-4 text-green-600 dark:text-green-400"/>Present</p>
                                    <p className="text-2xl font-bold">{stats.present}</p>
                                  </div>
                                   <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/40">
                                    <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground flex items-center justify-center md:justify-start gap-1"><X className="h-4 w-4 text-red-600 dark:text-red-400"/>Absent</p>
                                    <p className="text-2xl font-bold">{stats.absent}</p>
                                  </div>
                                   <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/40">
                                    <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground flex items-center justify-center md:justify-start gap-1"><Calendar className="h-4 w-4 text-yellow-600 dark:text-yellow-400"/>Half Days</p>
                                    <p className="text-2xl font-bold">{stats.halfDay}</p>
                                  </div>
                                   <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/40">
                                    <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground flex items-center justify-center md:justify-start gap-1"><IndianRupee className="h-4 w-4 text-purple-600 dark:text-purple-400"/>Total Payment</p>
                                    <p className="text-2xl font-bold">₹{stats.totalPayment.toFixed(2)}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })
                      ) : (
                        <p className="text-center py-8 text-muted-foreground dark:text-dark-muted-foreground">No employees to display. Add an employee to see their monthly summary.</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground dark:text-dark-muted-foreground">Please select a month to view the summary.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <ConfirmationDialog
        isOpen={!!employeeToDelete}
        onClose={() => setEmployeeToDelete(null)}
        onConfirm={confirmDeleteEmployee}
        title="Confirm Deletion"
        message={
          <>
            Are you sure you want to delete employee <strong>{employeeToDelete?.name}</strong>? 
            This will also remove all their associated attendance and payment records. 
            This action cannot be undone.
          </>
        }
      />
    </>
  );
};

export default EmployeeAttendanceTracker;