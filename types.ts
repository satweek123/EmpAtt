
export interface Employee {
  id: string;
  name: string;
  phone: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'half-day';

export interface DailyRecord {
  employeeId: string;
  status: AttendanceStatus;
  payment: number;
}

export type DailyRecords = Record<string, DailyRecord[]>;

export interface MonthlySummary {
  totalEmployees: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  totalPayments: number;
  averagePayment: number;
}

export interface EmployeeMonthlyStats {
  present: number;
  absent: number;
  halfDay: number;
  totalPayment: number;
}

export const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const calculateEmployeeMonthlyStats = (
  employeeId: string,
  dailyRecords: DailyRecords,
  selectedMonth: string // YYYY-MM
): EmployeeMonthlyStats => {
  let present = 0;
  let absent = 0;
  let halfDay = 0;
  let totalPayment = 0;

  Object.entries(dailyRecords).forEach(([dateStr, records]) => {
    if (dateStr.startsWith(selectedMonth)) {
      const record = records.find(r => r.employeeId === employeeId);
      if (record) {
        switch (record.status) {
          case 'present': present++; break;
          case 'absent': absent++; break;
          case 'half-day': halfDay++; break;
        }
        totalPayment += record.payment;
      }
    }
  });

  return { present, absent, halfDay, totalPayment };
};
