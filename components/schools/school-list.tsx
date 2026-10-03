"use client";

import React from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { countries, type School } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function SchoolList({ schools }: { schools: School[] }) {
  const [country, setCountry] = React.useState<string>("all");
  const [query, setQuery] = React.useState("");

  const filtered = schools.filter(
    (s) =>
      (country === "all" || s.country === country) &&
      s.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {["all", ...countries].map((c) => (
            <button
              key={c}
              onClick={() => setCountry(c)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm duration-150",
                country === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:border-primary hover:text-primary",
              )}
            >
              {c === "all" ? "Tất cả" : c}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm tên trường..."
            aria-label="Tìm tên trường"
            className="h-9 w-full rounded-full border border-input bg-transparent pl-9 pr-3.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      </div>

      <Card className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên trường</TableHead>
              <TableHead>Quốc gia</TableHead>
              <TableHead>Điểm học tập tối thiểu</TableHead>
              <TableHead>Điểm IELTS tối thiểu</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{s.country}</Badge>
                </TableCell>
                <TableCell>{s.minGpa.toFixed(1)}</TableCell>
                <TableCell>{s.minIelts.toFixed(1)}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  Không tìm thấy trường phù hợp.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
