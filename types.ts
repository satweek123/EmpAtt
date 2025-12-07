
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
  if (!selectedMonth) {
    return { present: 0, absent: 0, halfDay: 0, totalPayment: 0 };
  }
  
  let present = 0;
  let absent = 0;
  let halfDay = 0;
  let totalPayment = 0;

  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr);
  const month = parseInt(monthStr); // 1-indexed month

  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // 1-indexed
  const currentDay = today.getDate();

  const isCurrentMonth = year === currentYear && month === currentMonth;
  const isPastMonth = year < currentYear || (year === currentYear && month < currentMonth);

  // Determine how many days to iterate over.
  // For past months, iterate over the whole month.
  // For the current month, iterate up to today.
  // For future months, iterate 0 days.
  let daysToIterate = 0;
  if (isPastMonth) {
    daysToIterate = daysInMonth;
  } else if (isCurrentMonth) {
    daysToIterate = currentDay;
  }

  for (let day = 1; day <= daysToIterate; day++) {
    const dayStr = day.toString().padStart(2, '0');
    const dateStr = `${selectedMonth}-${dayStr}`;
    
    const recordsForDay = dailyRecords[dateStr] || [];
    const record = recordsForDay.find(r => r.employeeId === employeeId);

    if (record) {
      switch (record.status) {
        case 'present':
          present++;
          break;
        case 'half-day':
          halfDay++;
          break;
        case 'absent':
          absent++;
          break;
      }
      totalPayment += record.payment;
    } else {
      // If no record exists for an iterated day (which is always past or present), count as absent.
      absent++;
    }
  }

  return { present, absent, halfDay, totalPayment };
};
