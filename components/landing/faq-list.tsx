"use client";

import { useState } from "react";
import { faqs } from "./content";

export function FaqList() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
      {faqs.map((item, index) => {
        const expanded = open === index;
        return (
          <div key={item.q}>
            <h3>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-6 py-5 text-left text-base font-medium"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? null : index)}
              >
                {item.q}
                <span aria-hidden="true" className="text-[var(--muted)]">
                  {expanded ? "–" : "+"}
                </span>
              </button>
            </h3>
            {expanded ? <p className="max-w-3xl pb-5 text-sm leading-6 text-[var(--muted)]">{item.a}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
