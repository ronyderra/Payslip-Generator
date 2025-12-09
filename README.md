# Payslip Generator

A NestJS server that generates PDF payslips from data received via GET request.

## Installation

```bash
npm install
```

## Running the app

```bash
# development
npm run start:dev

# production mode
npm run start:prod
```

## API Endpoint

### GET /generate-pdf

Generates a PDF payslip from query parameters.

**Query Parameters:**
- `employeeName` (string, required): Employee's full name
- `employeeId` (string, required): Employee ID
- `period` (string, required): Pay period (e.g., "January 2024")
- `basicSalary` (number, required): Basic salary amount
- `allowances` (number, optional, default: 0): Allowances amount
- `deductions` (number, optional, default: 0): Other deductions
- `tax` (number, optional, default: 0): Tax amount
- `netSalary` (number, required): Net salary amount

**Example Request:**
```
GET http://localhost:3000/generate-pdf?employeeName=John%20Doe&employeeId=EMP001&period=January%202024&basicSalary=5000&allowances=500&deductions=200&tax=750&netSalary=4550
```

**Response:**
- Content-Type: `application/pdf`
- Returns a PDF file as attachment

## Validation

All data is validated using Zod schemas. Invalid data will return a 400 Bad Request with validation errors.

