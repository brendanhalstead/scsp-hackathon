
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  query: string;
  onQueryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSearching: boolean;
  placeholder: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  query,
  onQueryChange,
  onSubmit,
  isSearching,
  placeholder
}) => {
  return (
    <form onSubmit={onSubmit} className="flex gap-2 w-full mb-2">
      <div className="relative flex-1">
        <Input
          type="text"
          value={query}
          onChange={onQueryChange}
          placeholder={placeholder}
          className="pr-10 bg-secondary/50 border-secondary"
          disabled={isSearching}
        />
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <Button 
        type="submit" 
        disabled={!query.trim() || isSearching}
        className={cn(
          "transition-all",
          isSearching && "animate-pulse"
        )}
      >
        {isSearching ? "Analyzing..." : "Extract Claims"}
      </Button>
    </form>
  );
};

export default SearchInput;
