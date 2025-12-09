import { z } from 'zod';

// Helper function to parse currency strings (e.g., " ₪4,500.00" -> 4500.00)
const parseCurrency = (val: string | number): number => {
  if (typeof val === 'number') {
    return val;
  }
  // Remove currency symbols, commas, and whitespace, then parse
  const cleaned = String(val)
    .replace(/[₪$€£¥,\s]/g, '') // Remove currency symbols, commas, and whitespace
    .trim();
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) {
    throw new Error('Invalid number format');
  }
  return parsed;
};

export const PayslipSchema = z.object({
  employeeName: z.union([z.string(), z.number()]).transform((val) => String(val)).pipe(z.string().min(1, 'Employee name is required')),
  employeeId: z.union([z.string(), z.number()]).transform((val) => String(val)).pipe(z.string().min(1, 'Employee ID is required')),
  email: z.union([z.string(), z.number()]).transform((val) => String(val)).pipe(z.string().email('Valid email is required')),
  period: z.union([z.string(), z.number()]).transform((val) => String(val)).pipe(z.string().min(1, 'Period is required')),
  basicSalary: z.union([z.string(), z.number()]).transform(parseCurrency).pipe(z.number().positive('Basic salary must be positive')),
  allowances: z.union([z.string(), z.number()]).transform(parseCurrency).pipe(z.number().min(0, 'Allowances must be non-negative')).default(0),
  deductions: z.union([z.string(), z.number()]).transform(parseCurrency).pipe(z.number().min(0, 'Deductions must be non-negative')).default(0),
  tax: z.union([z.string(), z.number()]).transform(parseCurrency).pipe(z.number().min(0, 'Tax must be non-negative')).default(0),
  netSalary: z.union([z.string(), z.number()]).transform(parseCurrency).pipe(z.number().positive('Net salary must be positive')),
});

export type PayslipDto = z.infer<typeof PayslipSchema>;

