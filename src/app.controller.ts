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
      // Pass query parameters directly to Zod schema for validation and parsing
      // Zod will handle type conversion and currency parsing
      const validatedData = PayslipSchema.parse(query);

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

