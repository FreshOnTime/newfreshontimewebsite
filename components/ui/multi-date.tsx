"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function MultiDateSelector({
  label,
  values,
  onChange,
  helperText,
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  helperText?: string;
}) {
  const [pending, setPending] = useState<string>("");

  const add = () => {
    const v = (pending || "").trim();
    if (!v) return;
    // Accept only ISO yyyy-mm-dd from date input
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return;
    if (values.includes(v)) return;
    const next = [...values, v].sort();
    onChange(next);
    setPending("");
  };

  const remove = (v: string) => {
    onChange(values.filter((d) => d !== v));
  };

  const clearAll = () => onChange([]);

  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      {helperText && (
        <p className="text-xs text-gray-500 mb-2">{helperText}</p>
      )}
      <div className="flex gap-2">
        <input
          type="date"
          className="border rounded px-2 py-1"
          value={pending}
          onChange={(e) => setPending(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        />
        <Button type="button" variant="outline" onClick={add}>Add</Button>
        {values.length > 0 && (
          <Button type="button" variant="ghost" onClick={clearAll}>Clear</Button>
        )}
      </div>

      {values.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {values.map((v) => (
            <Badge key={v} className="gap-2">
              {v}
              <button
                type="button"
                className="ml-1 text-xs opacity-70 hover:opacity-100"
                onClick={() => remove(v)}
                aria-label={`Remove ${v}`}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
