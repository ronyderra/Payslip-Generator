import { z } from 'zod';

export const PayslipSchema = z.object({
  employeeName: z.string().min(1, 'Employee name is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  email: z.string().email('Valid email is required'),
  period: z.string().min(1, 'Period is required'),
  basicSalary: z.number().positive('Basic salary must be positive'),
  allowances: z.number().min(0, 'Allowances must be non-negative').default(0),
  deductions: z.number().min(0, 'Deductions must be non-negative').default(0),
  tax: z.number().min(0, 'Tax must be non-negative').default(0),
  netSalary: z.number().positive('Net salary must be positive'),
});

export type PayslipDto = z.infer<typeof PayslipSchema>;

