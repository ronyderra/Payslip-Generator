import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');
import { PayslipDto } from './dto/payslip.dto';

@Injectable()
export class AppService {
  generatePdf(data: PayslipDto): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.fontSize(20).text('PAYSLIP', { align: 'center' });
        doc.moveDown();

        // Company/Employee Info
        doc.fontSize(12);
        doc.text(`Employee Name: ${data.employeeName}`);
        doc.text(`Employee ID: ${data.employeeId}`);
        doc.text(`Email: ${data.email}`);
        doc.text(`Period: ${data.period}`);
        doc.moveDown();

        // Salary Details
        doc.fontSize(14).text('Salary Details', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12);
        
        doc.text(`Basic Salary: $${data.basicSalary.toFixed(2)}`, { continued: true });
        doc.text(`Allowances: $${data.allowances.toFixed(2)}`, { align: 'right' });
        
        const grossSalary = data.basicSalary + data.allowances;
        doc.moveDown(0.5);
        doc.text(`Gross Salary: $${grossSalary.toFixed(2)}`, { align: 'right' });
        doc.moveDown();

        // Deductions
        doc.fontSize(14).text('Deductions', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12);
        doc.text(`Tax: $${data.tax.toFixed(2)}`);
        doc.text(`Other Deductions: $${data.deductions.toFixed(2)}`);
        doc.moveDown();

        // Net Salary
        doc.fontSize(16).text(`Net Salary: $${data.netSalary.toFixed(2)}`, { align: 'right' });
        doc.moveDown(2);

        // Footer
        doc.fontSize(10).text('This is a computer-generated document.', { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

