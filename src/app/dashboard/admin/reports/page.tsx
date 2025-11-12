'use client';

import ReportGenerator from "@/components/dashboard/report-generator";

export default function ReportsPage() {
    return (
        <div className="flex flex-col gap-6">
             <div>
                <h2 className="text-2xl font-bold tracking-tight">AI-Powered Reports</h2>
                <p className="text-muted-foreground">Generate insights into voyage operations.</p>
            </div>
            <ReportGenerator />
        </div>
    )
}
