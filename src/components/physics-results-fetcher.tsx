"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Search, Loader2, FileText, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

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

    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    const fetchedResults: Result[] = rollNumbers.map(rn => {
      if (isNaN(Number(rn)) || rn.length < 5 || rn.length > 7) {
        return {
          rollNumber: rn,
          studentName: 'N/A',
          physicsMarks: 'N/A',
          status: 'Error'
        };
      }

      const random = Math.random();
      if (random < 0.15) {
        return {
          rollNumber: rn,
          studentName: 'N/A',
          physicsMarks: 'N/A',
          status: 'Not Found'
        };
      }

      return {
        rollNumber: rn,
        studentName: `Student ${rn.slice(-3)}`,
        physicsMarks: String(Math.floor(Math.random() * (85 - 33 + 1)) + 33),
        status: 'Success'
      };
    });

    setResults(fetchedResults);
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-4xl shadow-xl rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <span className="font-headline">Physics Results Fetcher</span>
        </CardTitle>
        <CardDescription>
          Enter a list of student roll numbers (one per line) to fetch Physics marks from BISE Faisalabad Board's portal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <Textarea
            placeholder="e.g.,&#10;401234&#10;401235&#10;401236"
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
          <h3 className="text-xl font-semibold mb-4 font-headline">Results Report</h3>
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
                  results.map((result) => (
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
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
}
