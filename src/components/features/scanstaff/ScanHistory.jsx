"use client";

import React from "react";

const MOCK_LOGS = [
    {
        id: "1",
        ticket_id: "VALID123",
        result: "SUCCESS",
        scanned_at: "2026-01-13 09:12",
    },
    {
        id: "2",
        ticket_id: "INVALID999",
        result: "FAILED",
        scanned_at: "2026-01-13 09:18",
    },
];

export default function ScanHistory() {
    return (
        <div className="text-slate-900">
            <h1 className="text-xl font-semibold mb-4">Scan History (Today)</h1>

            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left p-3 font-medium text-slate-500">Ticket ID</th>
                                <th className="text-left p-3 font-medium text-slate-500">Result</th>
                                <th className="text-left p-3 font-medium text-slate-500">Scanned At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {MOCK_LOGS.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-3 font-mono text-slate-700">{log.ticket_id}</td>
                                    <td className="p-3">
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${log.result === "SUCCESS"
                                                    ? "bg-green-100 text-green-700 border border-green-200"
                                                    : "bg-red-100 text-red-700 border border-red-200"
                                                }`}
                                        >
                                            {log.result}
                                        </span>
                                    </td>
                                    <td className="p-3 text-slate-500">{log.scanned_at}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
