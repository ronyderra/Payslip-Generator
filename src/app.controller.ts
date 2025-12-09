import { Controller, Get, Query, Res, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { PayslipSchema, PayslipDto } from './dto/payslip.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHealth() {
    return { status: 'healthy', message: 'All is healthy' };
  }

  @Get('generate-pdf')
  async generatePdf(@Query() query: any, @Res() res: Response) {
    try {
      // Parse query parameters and convert to proper types
      const data: PayslipDto = {
        employeeName: query.employeeName || '',
        employeeId: query.employeeId || '',
        email: query.email || '',
        period: query.period || '',
        basicSalary: parseFloat(query.basicSalary) || 0,
        allowances: parseFloat(query.allowances) || 0,
        deductions: parseFloat(query.deductions) || 0,
        tax: parseFloat(query.tax) || 0,
        netSalary: parseFloat(query.netSalary) || 0,
      };

      // Validate data with Zod
      const validatedData = PayslipSchema.parse(data);

      // Generate PDF
      const pdfBuffer = await this.appService.generatePdf(validatedData);

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=payslip.pdf');
      res.setHeader('Content-Length', pdfBuffer.length);

      // Send PDF
      res.send(pdfBuffer);
    } catch (error) {
      if (error.name === 'ZodError') {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: error.errors,
        });
      }
      throw new BadRequestException('Failed to generate PDF: ' + error.message);
    }
  }
}

