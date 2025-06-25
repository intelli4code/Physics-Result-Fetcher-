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

// This is a simulated database of student results to mimic the real website.
const studentDatabase: Record<string, { studentName: string; physicsMarks: string }> = {
    "120166": { studentName: "HAMZA MUNIR", physicsMarks: "85" },
    "401235": { studentName: "AYESHA AHMED", physicsMarks: "78" },
    "401236": { studentName: "BILAL KHAN", physicsMarks: "92" },
    "401237": { studentName: "FATIMA ALI", physicsMarks: "65" },
    "401238": { studentName: "USMAN TARIQ", physicsMarks: "42" },
    "401239": { studentName: "SANA JAVED", physicsMarks: "55" },
};


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
    // Simulate network delay
    await new Promise(resolve =>
      setTimeout(resolve, 300 + Math.random() * 400)
    );

    // Validate the roll number format
    if (isNaN(Number(rollNumber)) || rollNumber.length < 5 || rollNumber.length > 7) {
      return {
        rollNumber: rollNumber,
        studentName: 'N/A',
        physicsMarks: 'N/A',
        status: 'Error',
      };
    }

    // Check our simulated database for the student's result
    const result = studentDatabase[rollNumber];

    if (result) {
      return {
        rollNumber: rollNumber,
        studentName: result.studentName,
        physicsMarks: result.physicsMarks,
        status: 'Success',
      };
    }

    // If the roll number is not in our database, return "Not Found"
    return {
      rollNumber: rollNumber,
      studentName: 'N/A',
      physicsMarks: 'N/A',
      status: 'Not Found',
    };
  }
);
