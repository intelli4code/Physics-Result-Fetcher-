# **App Name**: Physics Results Fetcher

## Core Features:

- Roll Number Input: Takes a list of student roll numbers as input.
- Roll Number Submission: Navigates to the provided URL (https://www.bisefsd.edu.pk/InterResults.aspx) and submits each roll number to the form.
- HTML Parsing: Parses the HTML response of each result page to extract the student's roll number and Physics marks.
- Error Handling: Handles cases where 'PHYSICS' is not found or the roll number is invalid, indicating 'N/A' or an error.
- Results Report: Compiles the extracted data into a report (e.g., a table or list) and shows the list in a scrollable element.

## Style Guidelines:

- Primary color: Soft blue (#A8D0E6) to evoke a sense of calm and trustworthiness.
- Background color: Light gray (#F0F4F8), very subtly blue, for a clean and professional look.
- Accent color: Teal (#43A2A6), slightly desaturated from blue, for interactive elements and important data.
- Font pairing: 'Inter' (sans-serif) for both headlines and body text to maintain a modern and readable design.
- Use simple, outline-style icons for indicating data types or actions.
- Clear and tabular layout for presenting the fetched results, with adequate spacing and alignment.
- Subtle loading animations or progress indicators when fetching data.