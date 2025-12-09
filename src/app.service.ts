import { Injectable } from '@nestjs/common';
const PdfPrinter = require('pdfmake');
import * as fs from 'fs';
import * as path from 'path';
import { PayslipDto } from './dto/payslip.dto';

@Injectable()
export class AppService {
  private fonts: any;

  constructor() {
    // Initialize fonts - try to load Hebrew fonts, fallback to system fonts
    this.initializeFonts();
  }

  private initializeFonts() {
    // Try multiple paths (development, production, and relative)
    const pathsToTry = [
      path.join(__dirname, 'assets', 'fonts'), // Production: dist/assets/fonts
      path.join(__dirname, '..', 'src', 'assets', 'fonts'), // Development: src/assets/fonts
      path.join(process.cwd(), 'src', 'assets', 'fonts'), // Alternative: from project root
    ];
    
    let actualNormalPath: string | null = null;
    let actualBoldPath: string | null = null;
    
    // Find the first path that exists
    for (const fontsPath of pathsToTry) {
      const normalPath = path.join(fontsPath, 'OpenSans-Regular.ttf');
      const boldPath = path.join(fontsPath, 'OpenSans-Bold.ttf');
      
      if (fs.existsSync(normalPath) && fs.existsSync(boldPath)) {
        actualNormalPath = normalPath;
        actualBoldPath = boldPath;
        break;
      }
    }
    
    if (actualNormalPath && actualBoldPath && fs.existsSync(actualNormalPath) && fs.existsSync(actualBoldPath)) {
      // Use loaded TTF fonts - use absolute paths
      const absoluteNormalPath = path.resolve(actualNormalPath);
      const absoluteBoldPath = path.resolve(actualBoldPath);
      console.log(`Loading Hebrew fonts from: ${absoluteNormalPath}`);
      
      // Try both buffer and absolute path approaches
      try {
        // First try with buffers
        this.fonts = {
          OpenSans: {
            normal: fs.readFileSync(absoluteNormalPath),
            bold: fs.readFileSync(absoluteBoldPath),
            italics: fs.readFileSync(absoluteNormalPath),
            bolditalics: fs.readFileSync(absoluteBoldPath),
          },
        };
      } catch (error) {
        // Fallback to absolute paths if buffer fails
        console.warn('Buffer loading failed, trying absolute paths');
        this.fonts = {
          OpenSans: {
            normal: absoluteNormalPath,
            bold: absoluteBoldPath,
            italics: absoluteNormalPath,
            bolditalics: absoluteBoldPath,
          },
        };
      }
    } else {
      console.warn('Hebrew fonts not found, using Helvetica fallback');
      console.warn('Note: Helvetica does not support Hebrew - text may appear as gibberish');
      console.warn('To fix: Download OpenSans fonts manually to src/assets/fonts/');
      // Fallback: Use Helvetica (standard PDF font that works without file paths)
      // This will work but Hebrew text will not render correctly
      this.fonts = {
        OpenSans: {
          normal: 'Helvetica',
          bold: 'Helvetica-Bold',
          italics: 'Helvetica-Oblique',
          bolditalics: 'Helvetica-BoldOblique',
        },
      };
    }
  }

  generatePdf(data: PayslipDto): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const printer = new PdfPrinter(this.fonts);
        const docDefinition = this.buildDocumentDefinition(data);
        const pdfDoc = printer.createPdfKitDocument(docDefinition);

        const chunks: Buffer[] = [];
        pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
        pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
        pdfDoc.on('error', reject);

        pdfDoc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private buildDocumentDefinition(data: PayslipDto): any {
    const currentDate = new Date().toLocaleDateString('he-IL');
    const grossSalary = data.basicSalary + data.allowances;
    const totalDeductions = data.tax + data.deductions;

    return {
      pageSize: 'A4',
      pageMargins: [56.7, 56.7, 56.7, 56.7], // 20mm in points (20mm * 2.835 = 56.7pt)
      pageOrientation: 'portrait',
      defaultStyle: {
        font: 'OpenSans',
        fontSize: 12,
        color: '#000000',
      },
      content: [
        // Border around entire payslip
        {
          canvas: [
            {
              type: 'rect',
              x: 0,
              y: 0,
              w: 481.89, // 170mm in points
              h: 728.5, // 257mm in points
              lineWidth: 1,
              lineColor: '#000000',
            },
          ],
          absolutePosition: { x: 56.7, y: 56.7 },
        },
        // Top row - Company info and header
        {
          columns: [
            {
              width: '48%',
              alignment: 'right',
              stack: [
                { text: `לקוח: 2377737`, lineHeight: 1.4, alignment: 'right' },
                { text: `חברה: 705 - מדיה קראש בע"מ`, lineHeight: 1.4, alignment: 'right' },
                { text: `תיק ניכויים: 923783971`, lineHeight: 1.4, alignment: 'right' },
                { text: `מספר תאגיד: 515704765`, lineHeight: 1.4, alignment: 'right' },
                { text: `תיק בי"ל: 92378397100`, lineHeight: 1.4, alignment: 'right' },
                { text: `כתובת: אריאל שרון 4, גבעתיים`, lineHeight: 1.4, alignment: 'right' },
              ],
            },
            {
              width: '48%',
              alignment: 'right',
              stack: [
                { text: `תלוש שכר לחודש: ${data.period}`, lineHeight: 1.4, alignment: 'right' },
                { text: `הודפס בתאריך: ${currentDate}`, lineHeight: 1.4, alignment: 'right' },
                { text: `דף 1 מתוך 1`, lineHeight: 1.4, alignment: 'right' },
                { text: `שכר מינימום חודשי: 5300.00`, lineHeight: 1.4, alignment: 'right' },
                { text: `שכר מינימום לשעה: 29.12`, lineHeight: 1.4, alignment: 'right' },
              ],
            },
          ],
          margin: [15, 10, 15, 8],
        },
        // Title - פרטים אישיים
        {
          text: 'פרטים אישיים',
          fontSize: 14,
          bold: true,
          alignment: 'center',
          decoration: 'underline',
          margin: [0, 4, 0, 4],
        },
        // Personal details - Two columns
        {
          columns: [
            {
              width: '48%',
              stack: [
                {
                  columns: [
                    { text: 'מספר זהות:', bold: true, width: 'auto', margin: [0, 0, 4, 2] },
                    { text: '316287341', width: '*' },
                  ],
                },
                {
                  columns: [
                    { text: 'מספר עובד:', bold: true, width: 'auto', margin: [0, 0, 4, 2] },
                    { text: data.employeeId, width: '*' },
                  ],
                },
                {
                  columns: [
                    { text: 'בסיס שכר:', bold: true, width: 'auto', margin: [0, 0, 4, 2] },
                    { text: 'שעתי', width: '*' },
                  ],
                },
                {
                  columns: [
                    { text: 'וותק:', bold: true, width: 'auto', margin: [0, 0, 4, 2] },
                    { text: '00.00.05', width: '*' },
                  ],
                },
                {
                  columns: [
                    { text: 'מחלקה:', bold: true, width: 'auto', margin: [0, 0, 4, 2] },
                    { text: '200 - מכירות אינסטנט', width: '*' },
                  ],
                },
                {
                  columns: [
                    { text: 'תחילת עבודה:', bold: true, width: 'auto', margin: [0, 0, 4, 2] },
                    { text: '27/10/2019', width: '*' },
                  ],
                },
                {
                  columns: [
                    { text: 'מצב משפחתי:', bold: true, width: 'auto', margin: [0, 0, 4, 2] },
                    { text: 'רווק (ר0+)', width: '*' },
                  ],
                },
              ],
            },
            {
              width: '48%',
              stack: [
                {
                  columns: [
                    { text: 'בנק:', bold: true, width: 'auto', margin: [0, 0, 4, 2] },
                    { text: '31/021', width: '*' },
                  ],
                },
                {
                  columns: [
                    { text: 'חשבון:', bold: true, width: 'auto', margin: [0, 0, 4, 2] },
                    { text: '000681458', width: '*' },
                  ],
                },
                {
                  columns: [
                    { text: 'שם עובד:', bold: true, width: 'auto', margin: [0, 0, 4, 2] },
                    { text: data.employeeName, width: '*' },
                  ],
                },
                {
                  columns: [
                    { text: 'כתובת:', bold: true, width: 'auto', margin: [0, 0, 4, 2] },
                    { text: 'הרצל 61, כפר סבא 44213', width: '*' },
                  ],
                },
                {
                  columns: [
                    { text: 'תושב:', bold: true, width: 'auto', margin: [0, 0, 4, 2] },
                    { text: 'כן', width: '*' },
                  ],
                },
                {
                  columns: [
                    { text: 'שעות עבודה:', bold: true, width: 'auto', margin: [0, 0, 4, 2] },
                    { text: '29.0', width: '*' },
                  ],
                },
                {
                  columns: [
                    { text: 'ימי עבודה:', bold: true, width: 'auto', margin: [0, 0, 4, 2] },
                    { text: '4', width: '*' },
                  ],
                },
              ],
            },
          ],
          margin: [15, 0, 15, 0],
        },
        // Payments section title
        {
          text: 'תשלומים',
          bold: true,
          margin: [15, 10, 15, 4],
          border: [false, false, false, true],
          alignment: 'right',
        },
        // Payments table
        {
          table: {
            headerRows: 1,
            widths: [50, '*', 60, 60, 50, 60, 70],
            body: [
              [
                { text: 'קוד', bold: true, alignment: 'center', fillColor: '#f5f5f5' },
                { text: 'תיאור התשלום', bold: true, alignment: 'center', fillColor: '#f5f5f5' },
                { text: 'כמות', bold: true, alignment: 'center', fillColor: '#f5f5f5' },
                { text: 'תעריף', bold: true, alignment: 'center', fillColor: '#f5f5f5' },
                { text: 'גילום', bold: true, alignment: 'center', fillColor: '#f5f5f5' },
                { text: 'שווי למס', bold: true, alignment: 'center', fillColor: '#f5f5f5' },
                { text: 'תשלום', bold: true, alignment: 'center', fillColor: '#f5f5f5' },
              ],
              [
                '001',
                'משכורת',
                '29.00',
                '35.00',
                '',
                '',
                data.basicSalary.toFixed(2),
              ],
              [
                '004',
                'נסיעות',
                '4.00',
                '11.80',
                '',
                '',
                data.allowances.toFixed(2),
              ],
              [
                { text: 'סה"כ תשלומים', colSpan: 6, alignment: 'right', bold: true },
                '',
                '',
                '',
                '',
                '',
                grossSalary.toFixed(2),
              ],
            ],
          },
          layout: {
            hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 1 : 0),
            vLineWidth: () => 1,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
            paddingLeft: () => 4,
            paddingRight: () => 4,
            paddingTop: () => 3,
            paddingBottom: () => 3,
          },
          margin: [15, 6, 15, 6],
        },
        // Deductions section title
        {
          text: 'ניכויי חובה',
          bold: true,
          margin: [15, 0, 15, 4],
          border: [false, false, false, true],
          alignment: 'right',
        },
        // Deductions table
        {
          table: {
            headerRows: 1,
            widths: ['*', 80],
            body: [
              [
                { text: 'תיאור', bold: true, alignment: 'center', fillColor: '#f5f5f5' },
                { text: 'ניכוי', bold: true, alignment: 'center', fillColor: '#f5f5f5' },
              ],
              ['בטוח לאומי', data.deductions.toFixed(2)],
              ['מס בריאות', data.tax.toFixed(2)],
              [
                { text: 'סה"כ ניכויי חובה', alignment: 'right', bold: true },
                totalDeductions.toFixed(2),
              ],
            ],
          },
          layout: {
            hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 1 : 0),
            vLineWidth: () => 1,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
            paddingLeft: () => 4,
            paddingRight: () => 4,
            paddingTop: () => 3,
            paddingBottom: () => 3,
          },
          margin: [15, 6, 15, 0],
        },
        // Net pay
        {
          text: `שכר נטו לתשלום: ${data.netSalary.toFixed(2)} ₪`,
          fontSize: 14,
          bold: true,
          alignment: 'right',
          margin: [15, 8, 15, 0],
        },
        // Bottom info blocks
        {
          columns: [
            {
              width: '32%',
              border: [true, true, true, true],
              margin: [15, 8, 0, 0],
              stack: [
                {
                  text: 'נתונים נוספים',
                  bold: true,
                  alignment: 'center',
                  margin: [4, 4, 4, 4],
                  border: [false, false, false, true],
                },
                { text: 'אחוז מס שולי: 10%', fontSize: 11, margin: [4, 4, 4, 0] },
                { text: `שכר חייב מס: ${grossSalary.toFixed(2)}`, fontSize: 11, margin: [4, 0, 4, 0] },
                { text: `שכר לבטוח לאומי: ${grossSalary.toFixed(2)}`, fontSize: 11, margin: [4, 0, 4, 0] },
                { text: 'בטוח לאומי מעביד: 37.89', fontSize: 11, margin: [4, 0, 4, 4] },
              ],
            },
            {
              width: '32%',
              border: [true, true, true, true],
              margin: [0, 8, 0, 0],
              stack: [
                {
                  text: 'חופשה',
                  bold: true,
                  alignment: 'center',
                  margin: [4, 4, 4, 4],
                  border: [false, false, false, true],
                },
                { text: 'יתרה קודמת: 0.00', fontSize: 11, margin: [4, 4, 4, 0] },
                { text: 'צבירה חודש זה: 0.16', fontSize: 11, margin: [4, 0, 4, 0] },
                { text: 'ניצול חודש זה: 0.00', fontSize: 11, margin: [4, 0, 4, 0] },
                { text: 'יתרה חדשה: 0.16', fontSize: 11, margin: [4, 0, 4, 4] },
              ],
            },
            {
              width: '32%',
              border: [true, true, true, true],
              margin: [0, 8, 15, 0],
              stack: [
                {
                  text: 'מחלה',
                  bold: true,
                  alignment: 'center',
                  margin: [4, 4, 4, 4],
                  border: [false, false, false, true],
                },
                { text: 'יתרה קודמת: 0.00', fontSize: 11, margin: [4, 4, 4, 0] },
                { text: 'צבירה חודש זה: 0.24', fontSize: 11, margin: [4, 0, 4, 0] },
                { text: 'ניצול חודש זה: 0.00', fontSize: 11, margin: [4, 0, 4, 0] },
                { text: 'יתרה חדשה: 0.24', fontSize: 11, margin: [4, 0, 4, 4] },
              ],
            },
          ],
        },
        // Footer row
        {
          columns: [
            { text: 'אופן תשלום: ישירות', fontSize: 11, width: 'auto', alignment: 'right' },
            { text: 'חישוב מצטבר: כן', fontSize: 11, width: 'auto', alignment: 'right' },
            { text: 'י"ע בחברה: 22 | ש"ע בחברה: 182.0', fontSize: 11, width: '*', alignment: 'right' },
          ],
          margin: [15, 6, 15, 0],
        },
      ],
    };
  }
}

