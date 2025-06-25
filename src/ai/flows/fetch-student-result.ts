'use server';
/**
 * @fileOverview A flow for fetching student results by scraping the official website.
 *
 * - fetchStudentResult - A function that fetches student result data for a given roll number.
 * - FetchStudentResultInput - The input type for the fetchStudentResult function.
 * - FetchStudentResultOutput - The return type for the fetchStudentResult function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import * as cheerio from 'cheerio';

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
    const url = 'https://www.bisefsd.edu.pk/InterResults.aspx';
    try {
      // Step 1: GET the page to get the VIEWSTATE and other ASP.NET fields
      const initialResponse = await fetch(url);
      const initialHtml = await initialResponse.text();
      const $initial = cheerio.load(initialHtml);

      const viewState = $initial('#__VIEWSTATE').val();
      const viewStateGenerator = $initial('#__VIEWSTATEGENERATOR').val();
      const eventValidation = $initial('#__EVENTVALIDATION').val();

      if (!viewState) {
        console.error('Could not find VIEWSTATE on the results page.');
        return {
          rollNumber,
          studentName: 'N/A',
          physicsMarks: 'N/A',
          status: 'Error',
        };
      }

      // Step 2: POST the form with the roll number and captured fields
      const formData = new URLSearchParams();
      formData.append('ctl00$ContentPlaceHolder1$ddlExam', '72'); // First Annual 2024
      formData.append('ctl00$ContentPlaceHolder1$txtRollNo', rollNumber);
      formData.append('ctl00$ContentPlaceHolder1$btnResult', ' Get Result');
      formData.append('__VIEWSTATE', viewState);
      formData.append('__VIEWSTATEGENERATOR', viewStateGenerator || '');
      formData.append('__EVENTVALIDATION', eventValidation || '');
      formData.append('__EVENTTARGET', '');
      formData.append('__EVENTARGUMENT', '');


      const resultResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Referer': url,
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        },
        body: formData.toString(),
      });

      const resultHtml = await resultResponse.text();
      const $result = cheerio.load(resultHtml);

      // Step 3: Parse the result page
      const studentName = $result('#ContentPlaceHolder1_lblNameValue').text().trim();

      if (!studentName) {
        return {
          rollNumber,
          studentName: 'N/A',
          physicsMarks: 'N/A',
          status: 'Not Found',
        };
      }

      let physicsMarks = 'N/A';
      // Find the table row containing "PHYSICS"
      $result('#ContentPlaceHolder1_gvSubjects tr').each((i, row) => {
        const rowText = $result(row).text();
        if (rowText.includes('PHYSICS')) {
          // The total marks are in the last table cell (td) of that row
          physicsMarks = $result(row).find('td').last().text().trim();
          return false; // break the loop once found
        }
      });

      return {
        rollNumber,
        studentName,
        physicsMarks: physicsMarks || 'N/A', // ensure it's not an empty string
        status: 'Success',
      };
    } catch (error) {
      console.error(`Error scraping for roll number ${rollNumber}:`, error);
      return {
        rollNumber,
        studentName: 'N/A',
        physicsMarks: 'N/A',
        status: 'Error',
      };
    }
  }
);
