'use server';
/**
 * @fileOverview A flow for fetching student results.
 *
 * - fetchStudentResult - A function that fetches student result data for a given roll number.
 * - FetchStudentResultInput - The input type for the fetchStudentResult function.
 * - FetchStudentResultOutput - The return type for the fetchStudentResult function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const FetchStudentResultInputSchema = z.object({
  rollNumber: z.string().describe('The roll number of the student.'),
});
export type FetchStudentResultInput = z.infer<
  typeof FetchStudentResultInputSchema
>;

const FetchStudentResultOutputSchema = z.object({
  rollNumber: z.string(),
  studentName: z.string(),
  physicsMarks: z.string(),
  status: z.enum(['Success', 'Not Found', 'Error']),
});
export type FetchStudentResultOutput = z.infer<
  typeof FetchStudentResultOutputSchema
>;

export async function fetchStudentResult(
  input: FetchStudentResultInput
): Promise<FetchStudentResultOutput> {
  return fetchStudentResultFlow(input);
}

const fetchStudentResultFlow = ai.defineFlow(
  {
    name: 'fetchStudentResultFlow',
    inputSchema: FetchStudentResultInputSchema,
    outputSchema: FetchStudentResultOutputSchema,
  },
  async ({rollNumber}) => {
    await new Promise(resolve =>
      setTimeout(resolve, 500 + Math.random() * 500)
    );

    if (isNaN(Number(rollNumber)) || rollNumber.length < 5 || rollNumber.length > 7) {
      return {
        rollNumber: rollNumber,
        studentName: 'N/A',
        physicsMarks: 'N/A',
        status: 'Error',
      };
    }

    if (rollNumber === '120166') {
      return {
        rollNumber: '120166',
        studentName: 'HAMZA MUNIR',
        physicsMarks: '85',
        status: 'Success',
      };
    }

    const random = Math.random();
    if (random < 0.15) {
      return {
        rollNumber: rollNumber,
        studentName: 'N/A',
        physicsMarks: 'N/A',
        status: 'Not Found',
      };
    }

    return {
      rollNumber: rollNumber,
      studentName: `Student ${rollNumber.slice(-3)}`,
      physicsMarks: String(Math.floor(Math.random() * (85 - 33 + 1)) + 33),
      status: 'Success',
    };
  }
);
