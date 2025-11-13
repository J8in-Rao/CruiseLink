'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReportGenerator() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Generator</CardTitle>
        <CardDescription>Generate a new report.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Click the button to generate a new report.</p>
      </CardContent>
      <CardFooter>
        <Button>Generate Report</Button>
      </CardFooter>
    </Card>
  );
}
