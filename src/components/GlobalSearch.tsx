import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { globalSearch, type SearchResult } from "@/lib/search";

const typeLabel: Record<string, string> = {
  post: "Blog",
  project: "Projeto",
  product: "Produto",
};

export function GlobalSearch() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        setResults(await globalSearch(trimmed));
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [query]);

  const goTo = (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    navigate(result.url);
  };

  const submitFullSearch = () => {
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <>
      <Button variant="outline" className="hidden h-9 px-3 xl:min-w-36 justify-start gap-2 text-muted-foreground lg:inline-flex shrink-0" onClick={() => setOpen(true)}>
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden xl:inline">Procurar...</span>
      </Button>
      <Button variant="ghost" size="icon" className="lg:hidden shrink-0" onClick={() => setOpen(true)}>
        <Search className="h-5 w-5" />
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Pesquisar posts, projetos e produtos..." value={query} onValueChange={setQuery} onKeyDown={(e) => e.key === "Enter" && submitFullSearch()} />
        <CommandList>
          <CommandEmpty>{loading ? "A pesquisar..." : "Sem resultados."}</CommandEmpty>
          <CommandGroup heading="Resultados">
            {results.map((result) => (
              <CommandItem key={`${result.type}-${result.id}`} value={`${result.title}-${result.type}`} onSelect={() => goTo(result)}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{result.title}</span>
                    <Badge variant="secondary" className="shrink-0">{typeLabel[result.type] ?? result.type}</Badge>
                  </div>
                  {result.description && <p className="line-clamp-1 text-xs text-muted-foreground">{result.description}</p>}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
