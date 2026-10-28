import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { globalSearch, type SearchResult, type SearchType } from "@/lib/search";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const typeLabel: Record<string, string> = { all: "Todos", post: "Blog", project: "Projetos", product: "Produtos" };

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [type, setType] = useState<SearchType>((params.get("type") as SearchType) || "all");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const trimmedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (trimmedQuery) next.set("q", trimmedQuery);
    if (type !== "all") next.set("type", type);
    setParams(next, { replace: true });
  }, [trimmedQuery, type, setParams]);

  useEffect(() => {
    if (trimmedQuery.length < 2) {
      setResults([]);
      return;
    }
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        setResults(await globalSearch(trimmedQuery, type));
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [trimmedQuery, type]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Pesquisa</h1>
        <p className="text-muted-foreground">Encontra conteúdos, projetos e produtos da plataforma.</p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_180px]">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar..." className="pl-9" />
        </div>
        <Select value={type} onValueChange={(value) => setType(value as SearchType)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="post">Blog</SelectItem>
            <SelectItem value="project">Projetos</SelectItem>
            <SelectItem value="product">Produtos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-8 space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">A pesquisar...</p>
        ) : trimmedQuery.length < 2 ? (
          <p className="text-sm text-muted-foreground">Escreve pelo menos 2 caracteres.</p>
        ) : results.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum resultado encontrado.</p>
        ) : (
          results.map((result) => (
            <Link key={`${result.type}-${result.id}`} to={result.url}>
              <Card className="transition-colors hover:bg-accent">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-foreground">{result.title}</h2>
                    <Badge variant="secondary">{typeLabel[result.type]}</Badge>
                  </div>
                  {result.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{result.description}</p>}
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
