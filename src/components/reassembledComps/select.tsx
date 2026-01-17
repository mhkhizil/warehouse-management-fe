import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface SelectProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  placeholder?: string;
  className?: string;
  minWidth?: string;
  disabled?: boolean;
}

export function Select<T extends string>({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  className,
  minWidth = "min-w-[7rem]",
  disabled = false,
}: SelectProps<T>) {
  const selectedOption = options.find((option) => option.value === value);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownWidth, setDropdownWidth] = useState<string>("auto");

  const handleOpenChange = (open: boolean) => {
    if (open && triggerRef.current) {
      const width = triggerRef.current.offsetWidth;
      setDropdownWidth(`${width}px`);
    }
  };

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          ref={triggerRef}
          variant="outline"
          className={cn("justify-between h-10", minWidth, className)}
          disabled={disabled}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 ml-2 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        style={{ width: dropdownWidth }}
        className={cn("min-w-fit", minWidth)}
      >
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "cursor-pointer",
              value === option.value && "bg-accent"
            )}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
