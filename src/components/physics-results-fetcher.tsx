"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Search, Loader2, FileText, CheckCircle2, XCircle, AlertTriangle, Download, Filter, X } from "lucide-react";
import { fetchStudentResult } from "@/ai/flows/fetch-student-result";

type Result = {
  rollNumber: string;
  studentName: string;
  physicsMarks: string;
  status: 'Success' | 'Not Found' | 'Error';
};

const StatusDisplay = ({ status }: { status: Result['status'] }) => {
  const statusConfig = {
    Success: { icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-500", label: "Success" },
    'Not Found': { icon: XCircle, color: "text-destructive", label: "Not Found" },
    Error: { icon: AlertTriangle, color: "text-amber-600 dark:text-amber-500", label: "Invalid Roll No." },
  };

  const { icon: Icon, color, label } = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-2 font-medium", color)}>
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </div>
  );
};


export function PhysicsResultsFetcher() {
  const [rollNumbersInput, setRollNumbersInput] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [minMarksFilter, setMinMarksFilter] = useState('');
  const [filteredResults, setFilteredResults] = useState<Result[] | null>(null);
  const { toast } = useToast();

  const handleFetchResults = async () => {
    const rollNumbers = rollNumbersInput.split('\n').map(rn => rn.trim()).filter(Boolean);

    if (rollNumbers.length === 0) {
      toast({
        variant: "destructive",
        title: "No Roll Numbers",
        description: "Please enter at least one roll number in the text area.",
      });
      return;
    }

    setIsLoading(true);
    setResults([]);
    setFilteredResults(null);
    setMinMarksFilter('');


    try {
      const resultPromises = rollNumbers.map(rollNumber => fetchStudentResult({ rollNumber }));
      const fetchedResults = await Promise.all(resultPromises);
      setResults(fetchedResults);
    } catch (error) {
      console.error("Failed to fetch results:", error);
      toast({
        variant: "destructive",
        title: "An Error Occurred",
        description: "Could not fetch results. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resultsToDisplay = filteredResults ?? results;

  const handleGeneratePdf = () => {
    if (resultsToDisplay.length === 0) return;

    const doc = new jsPDF();
    const tableData = resultsToDisplay.map(r => [r.rollNumber, r.studentName, r.physicsMarks, r.status]);
    const isFiltered = filteredResults !== null;

    doc.setFontSize(18);
    doc.text("Physics Results Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Fetched on: ${new Date().toLocaleDateString()}`, 14, 29);
    if(isFiltered) {
        doc.text(`Filtered by: Minimum ${minMarksFilter} Physics Marks`, 14, 36);
    }

    autoTable(doc, {
      startY: isFiltered ? 42 : 35,
      head: [['Roll Number', 'Student Name', 'Physics Marks', 'Status']],
      body: tableData,
      headStyles: { fillColor: [0, 119, 146] }, // A shade of blue-green
      didDrawPage: (data) => {
        const str = `Page ${doc.internal.getNumberOfPages()}`;
        doc.setFontSize(10);
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        doc.text(str, data.settings.margin.left, pageHeight - 10);
      }
    });

    doc.save('physics-results.pdf');
  };

  const handleApplyFilter = () => {
    const minMarks = parseInt(minMarksFilter, 10);
    if (isNaN(minMarks)) {
      toast({
        variant: "destructive",
        title: "Invalid Filter",
        description: "Please enter a valid number for minimum marks.",
      });
      return;
    }

    const filtered = results.filter(result => {
      const marks = parseInt(result.physicsMarks, 10);
      return !isNaN(marks) && marks >= minMarks;
    });

    setFilteredResults(filtered);
  };

  const handleClearFilter = () => {
    setFilteredResults(null);
    setMinMarksFilter('');
  };


  return (
    <Card className="w-full max-w-4xl shadow-xl rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <span className="font-headline">Physics Results Fetcher</span>
        </CardTitle>
        <CardDescription>
          Enter a list of student roll numbers (one per line) to fetch Physics marks for the First Annual 2024 exam.
          Results are fetched from the official <a href="https://www.bisefsd.edu.pk/InterResults.aspx" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">BISE Faisalabad Board's portal</a>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <Textarea
            placeholder="e.g.,&#10;120166&#10;401235&#10;401236"
            value={rollNumbersInput}
            onChange={(e) => setRollNumbersInput(e.target.value)}
            rows={6}
            disabled={isLoading}
            className="text-base"
          />
          <Button onClick={handleFetchResults} disabled={isLoading || !rollNumbersInput.trim()} size="lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Fetching Results...
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
                Fetch Results
              </>
            )}
          </Button>
        </div>
      </CardContent>

      {(isLoading || results.length > 0) && (
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold font-headline">Results Report</h3>
            <Button onClick={handleGeneratePdf} disabled={isLoading || resultsToDisplay.length === 0}>
              <Download className="mr-2 h-4 w-4"/>
              Generate PDF
            </Button>
          </div>
          <div className="flex items-end gap-2 mb-4 p-4 border rounded-lg bg-muted/50">
            <div className="grid gap-1.5 flex-grow">
              <Label htmlFor="min-marks">Filter by Minimum Physics Marks</Label>
              <Input
                id="min-marks"
                type="number"
                placeholder="e.g., 75"
                value={minMarksFilter}
                onChange={(e) => setMinMarksFilter(e.target.value)}
                disabled={isLoading || results.length === 0}
              />
            </div>
            <Button onClick={handleApplyFilter} disabled={isLoading || results.length === 0 || !minMarksFilter}>
              <Filter className="mr-2 h-4 w-4" />
              Apply Filter
            </Button>
            {filteredResults !== null && (
              <Button variant="outline" onClick={handleClearFilter}>
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
          <ScrollArea className="h-80 w-full rounded-md border bg-background/50">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Roll Number</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead className="text-center">Physics Marks</TableHead>
                  <TableHead className="w-[180px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-5 w-12 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  resultsToDisplay.map((result) => (
                    <TableRow key={result.rollNumber}>
                      <TableCell className="font-mono">{result.rollNumber}</TableCell>
                      <TableCell>{result.studentName}</TableCell>
                      <TableCell className="text-center font-medium">{result.physicsMarks}</TableCell>
                      <TableCell>
                        <StatusDisplay status={result.status} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {!isLoading && results.length > 0 && resultsToDisplay.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No students match the current filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
}
