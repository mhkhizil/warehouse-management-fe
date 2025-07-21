import React from "react";
import { Input } from "@/components/ui/input";
import { Select } from "./select";
import { Search as SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchOption {
  value: string;
  label: string;
}

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (e: React.FormEvent) => void;
  placeholder?: string;
  searchType?: string;
  searchTypeOptions?: readonly SearchOption[];
  onSearchTypeChange?: (value: string) => void;
  showSearchType?: boolean;
  className?: string;
  inputClassName?: string;
  selectClassName?: string;
}

export function Search({
  value,
  onChange,
  onSearch,
  placeholder = "Search...",
  searchType,
  searchTypeOptions = [],
  onSearchTypeChange,
  showSearchType = false,
  className,
  inputClassName,
  selectClassName,
}: SearchProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(e);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex gap-2 w-full sm:w-auto", className)}
    >
      <div className="relative flex-1 sm:w-80">
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn("pl-8", inputClassName)}
          onKeyPress={(e) => e.key === "Enter" && onSearch?.(e)}
        />
      </div>
      {showSearchType && searchTypeOptions.length > 0 && onSearchTypeChange && (
        <Select
          value={searchType || searchTypeOptions[0]?.value}
          onValueChange={onSearchTypeChange}
          options={searchTypeOptions}
          className={selectClassName}
        />
      )}
    </form>
  );
}

interface SearchWithTypeProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (e: React.FormEvent) => void;
  searchType: string;
  onSearchTypeChange: (value: string) => void;
  searchTypeOptions: readonly SearchOption[];
  placeholder?: string;
  className?: string;
}

export function SearchWithType({
  value,
  onChange,
  onSearch,
  searchType,
  onSearchTypeChange,
  searchTypeOptions,
  placeholder,
  className,
}: SearchWithTypeProps) {
  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    const selectedOption = searchTypeOptions.find(
      (opt) => opt.value === searchType
    );
    return `Search by ${selectedOption?.label.toLowerCase() || "name"}...`;
  };

  return (
    <Search
      value={value}
      onChange={onChange}
      onSearch={onSearch}
      placeholder={getPlaceholder()}
      searchType={searchType}
      searchTypeOptions={searchTypeOptions}
      onSearchTypeChange={onSearchTypeChange}
      showSearchType={true}
      className={className}
    />
  );
}
