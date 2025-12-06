
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "./components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/Card";
import { Input } from "./components/Input";
import { Label } from "./components/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/Tabs";
import {
  Plus,
  Edit,
  Trash,
  Sun,
  Moon,
  Calendar,
  Users,
  Check,
  X,
  IndianRupee,
  Percent
} from "lucide-react";
import {
  Employee,
  DailyRecords,
  AttendanceStatus,
  DailyRecord,
  MonthlySummary,
  EmployeeMonthlyStats,
  getLocalDateString,
  calculateEmployeeMonthlyStats
} from './types';


const EmployeeAttendanceTracker: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dailyRecords, setDailyRecords] = useState<DailyRecords>({});
  const [currentDate, setCurrentDate] = useState<string>(getLocalDateString(new Date()));
  const [selectedMonth, setSelectedMonth] = useState<string>(getLocalDateString(new Date()).slice(0, 7));
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showEmployeeForm, setShowEmployeeForm] = useState<boolean>(false);
  const [newEmployee, setNewEmployee] = useState<Omit<Employee, 'id'>>({ name: '', phone: '' });
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [editEmployeeData, setEditEmployeeData] = useState<Employee>({ id: '', name: '', phone: '' });

  useEffect(() => {
    try {
      const savedEmployees = localStorage.getItem('employees');
      const savedRecords = localStorage.getItem('dailyRecords');
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;

      if (savedEmployees) setEmployees(JSON.parse(savedEmployees));
      if (savedRecords) setDailyRecords(JSON.parse(savedRecords));
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('dailyRecords', JSON.stringify(dailyRecords));
  }, [dailyRecords]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const addEmployee = () => {
    if (!newEmployee.name.trim()) {
      alert("Employee name cannot be empty.");
      return;
    }
    const employee: Employee = { id: Date.now().toString(), ...newEmployee };
    setEmployees([...employees, employee]);
    setNewEmployee({ name: '', phone: '' });
    setShowEmployeeForm(false);
  };

  const startEditEmployee = (employee: Employee) => {
    setEditingEmployeeId(employee.id);
    setEditEmployeeData(employee);
    setShowEmployeeForm(true);
  };

  const saveEditEmployee = () => {
    if (!editEmployeeData.name.trim()) return;
    setEmployees(employees.map(emp => emp.id === editingEmployeeId ? editEmployeeData : emp));
    setEditingEmployeeId(null);
    setShowEmployeeForm(false);
  };

  const deleteEmployee = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this employee and all their attendance records?")) return;
    setEmployees(employees.filter(emp => emp.id !== id));
    const updatedRecords = { ...dailyRecords };
    Object.keys(updatedRecords).forEach(date => {
      updatedRecords[date] = updatedRecords[date].filter(record => record.employeeId !== id);
    });
    setDailyRecords(updatedRecords);
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

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const formatDate = (dateString: string) => {
    // T00:00:00 is added to ensure the date is parsed in the local timezone, not UTC
    const date = new Date(dateString + 'T00:00:00');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });

    return `${weekday}, ${day}/${month}/${year}`;
  };
  
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 border-b pb-4 border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">Employee Attendance Tracker</h1>
            <p className="text-sm text-muted-foreground">Manage daily attendance and monthly payroll with ease.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            <Button onClick={() => { setShowEmployeeForm(!showEmployeeForm); setEditingEmployeeId(null); }} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
              <Plus className="h-4 w-4" />
              {showEmployeeForm ? 'Hide Form' : 'Add Employee'}
            </Button>
          </div>
        </header>

        {(showEmployeeForm || editingEmployeeId) && (
          <Card className="mb-8 shadow-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
            <CardHeader><CardTitle>{editingEmployeeId ? 'Edit Employee Details' : 'Add New Employee'}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-1"><Label htmlFor="name">Name*</Label><Input id="name" value={editingEmployeeId ? editEmployeeData.name : newEmployee.name} onChange={(e) => editingEmployeeId ? setEditEmployeeData({ ...editEmployeeData, name: e.target.value }) : setNewEmployee({ ...newEmployee, name: e.target.value })} placeholder="e.g. John Doe" /></div>
                <div className="md:col-span-1"><Label htmlFor="phone">Phone</Label><Input id="phone" value={editingEmployeeId ? editEmployeeData.phone : newEmployee.phone} onChange={(e) => editingEmployeeId ? setEditEmployeeData({ ...editEmployeeData, phone: e.target.value }) : setNewEmployee({ ...newEmployee, phone: e.target.value })} placeholder="e.g. 555-1234" type="tel" /></div>
                <div className="md:col-span-2 flex items-end gap-2">
                  {editingEmployeeId ? (<><Button onClick={saveEditEmployee} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"><Check className="h-4 w-4 mr-2" />Save Changes</Button><Button variant="outline" onClick={() => { setEditingEmployeeId(null); setShowEmployeeForm(false); }} className="flex-1"><X className="h-4 w-4 mr-2" />Cancel</Button></>) : (<Button onClick={addEmployee} className="w-full bg-green-600 hover:bg-green-700 text-white"><Plus className="h-4 w-4 mr-2" />Add Employee</Button>)}
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-red-500" />Daily Attendance</CardTitle>
                    <p className="text-muted-foreground font-semibold">{formatDate(currentDate)}</p>
                  </div>
                  <Input type="date" value={currentDate} onChange={(e) => setCurrentDate(e.target.value)} className="w-full sm:w-auto" />
                </div>
              </CardHeader>
              <CardContent>
                {employees.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg p-6 bg-gray-50 dark:bg-gray-800">
                    <p className="text-muted-foreground mb-4">No employees found. Add one to start tracking!</p>
                    <Button onClick={() => setShowEmployeeForm(true)} className="bg-orange-500 hover:bg-orange-600 text-white"><Plus className="h-4 w-4 mr-2" />Add First Employee</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {employees.map(employee => {
                      const record = getEmployeeRecord(employee.id);
                      return (
                        <Card key={employee.id} className="p-4 border-l-4 border-blue-500 dark:border-blue-400 shadow-md transition-all hover:shadow-lg">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1 flex items-center gap-3 min-w-40">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full"><Users className="h-6 w-6 text-blue-500 dark:text-blue-400" /></div>
                              <div>
                                <h3 className="font-bold text-lg">{employee.name}</h3>
                                <p className="text-sm text-muted-foreground">{employee.phone}</p>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                              <div className="flex items-center gap-2">
                                <Label htmlFor={`status-${employee.id}`} className="text-sm font-medium">Status:</Label>
                                <Select value={record?.status || 'absent'} onValueChange={(value) => updateAttendance(employee.id, value as AttendanceStatus)}>
                                  <SelectTrigger id={`status-${employee.id}`} className="w-32"><SelectValue /></SelectTrigger>
                                  <SelectContent><SelectItem value="present">Present</SelectItem><SelectItem value="absent">Absent</SelectItem><SelectItem value="half-day">Half Day</SelectItem></SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-center gap-2">
                                <Label htmlFor={`payment-${employee.id}`} className="text-sm font-medium">Payment: ₹</Label>
                                <Input id={`payment-${employee.id}`} type="number" value={record?.payment || ''} onChange={(e) => updatePayment(employee.id, parseFloat(e.target.value) || 0)} className="w-24 text-right" placeholder="0.00" min="0" />
                              </div>
                              <div className="flex gap-1 mt-2 sm:mt-0">
                                <Button variant="outline" size="icon" onClick={() => startEditEmployee(employee)}><Edit className="h-4 w-4 text-yellow-600" /></Button>
                                <Button variant="outline" size="icon" onClick={() => deleteEmployee(employee.id)}><Trash className="h-4 w-4 text-red-600" /></Button>
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle>Employee Monthly Summaries</CardTitle>
                  <Input id="month-select" type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full sm:w-auto" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employees.length > 0 ? (
                    employees.map(employee => {
                      const stats = employeeStatsMap[employee.id] || { present: 0, absent: 0, halfDay: 0, totalPayment: 0 };
                      return (
                        <Card key={employee.id} className="shadow-md hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full"><Users className="h-6 w-6 text-blue-500 dark:text-blue-400" /></div>
                              <div>
                                <CardTitle className="text-xl">{employee.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{employee.phone}</p>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left">
                              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/50">
                                <p className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-1"><Check className="h-4 w-4 text-green-600"/>Present</p>
                                <p className="text-2xl font-bold">{stats.present}</p>
                              </div>
                               <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/50">
                                <p className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-1"><X className="h-4 w-4 text-red-600"/>Absent</p>
                                <p className="text-2xl font-bold">{stats.absent}</p>
                              </div>
                               <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/50">
                                <p className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-1"><Calendar className="h-4 w-4 text-yellow-600"/>Half Days</p>
                                <p className="text-2xl font-bold">{stats.halfDay}</p>
                              </div>
                               <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/50">
                                <p className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-1"><IndianRupee className="h-4 w-4 text-purple-600"/>Total Payment</p>
                                <p className="text-2xl font-bold">₹{stats.totalPayment.toFixed(2)}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">No employees to display. Add an employee to see their monthly summary.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EmployeeAttendanceTracker;