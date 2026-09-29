"use client";

import { ArrowLeft, Search, X } from "lucide-react";
import { forwardRef } from "react";
import { BackButton } from "./ui";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  onFocus?: () => void;
  onBack?: () => void;
  placeholder?: string;
  back?: string | true;
  quiet?: boolean;
  autoFocus?: boolean;
  backVariant?: "round" | "arrow";
};

export const SearchBar = forwardRef<HTMLInputElement, Props>(function SearchBar(
  { value, onChange, onSubmit, onFocus, onBack, placeholder = "Search places, people", back, quiet, autoFocus, backVariant = "arrow" },
  ref,
) {
  return (
    <form role="search" className="row-c" style={{ gap: 10 }} onSubmit={(e) => { e.preventDefault(); onSubmit?.(); }}>
      {back && <BackButton href={back === true ? undefined : back} variant={backVariant} />}
      <div className={`search-field ${quiet ? "quiet" : ""}`}>
        {onBack ? (
          <button type="button" aria-label="Back to results list" onClick={onBack} style={{ width: 28, height: 36, display: "inline-flex", alignItems: "center", justifyContent: "flex-start", flexShrink: 0 }}>
            <ArrowLeft size={21} strokeWidth={2} />
          </button>
        ) : <Search size={20} strokeWidth={2} color="var(--ink-2)" aria-hidden="true" />}
        <label htmlFor="search-q" className="sr">Search places, people, hashtags</label>
        <input
          id="search-q" ref={ref} type="search" enterKeyHint="search" autoComplete="off" autoFocus={autoFocus}
          value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} onFocus={onFocus}
        />
        {value && (
          <button type="button" className="clear-x" aria-label="Clear search" onClick={() => onChange("")}>
            <X size={15} strokeWidth={2.2} />
          </button>
        )}
      </div>
    </form>
  );
});
