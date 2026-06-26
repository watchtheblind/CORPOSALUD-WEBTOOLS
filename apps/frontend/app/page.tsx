'use client';
import {useState} from 'react';
import {Badge} from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {FILTER_CATEGORIES, TOOLS_DATA} from '@/constants/filters.constants';
import content from '@/constants/content.constants';
function App() {
  const [activeFilter, setActiveFilter] = useState('todos');

  // Filtrar tarjetas según la categoría seleccionada
  const filteredTools =
    activeFilter === 'todos'
      ? TOOLS_DATA
      : TOOLS_DATA.filter((tool) => tool.category === activeFilter);

  return (
    <div className="flex min-h-screen bg-mauve-200 flex-col items-center justify-center p-6 md:p-24">
      {/* Título Principal */}
      <div className="text-center max-w-3xl">
        <h1 className="text-4xl md:text-6xl text-zinc-800 font-extrabold mb-6">
          {content.MAIN_DESCRIPTION}
        </h1>
        {/* Subtítulo informativo */}
        <p className="text-lg md:text-xl text-zinc-700 font-medium">
          {content.SECONDARY_DESCRIPTION}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 my-5 justify-center p-3 rounded-2xl">
        {FILTER_CATEGORIES.map((category) => (
          <Badge
            key={category.id}
            size="md"
            variant={activeFilter === category.id ? 'default' : 'outline'}
            className="cursor-pointer shadow-xl  stransition-all hover:scale-105 active:scale-95"
            onClick={() => setActiveFilter(category.id)}
          >
            {category.label}
          </Badge>
        ))}
      </div>

      {/* Contenedor Grid para tus Tarjetas de Shadcn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {filteredTools.map((tool) => (
          <a
            href={tool.href}
            key={tool.id}
            className="block group transition-transform duration-200 hover:-translate-y-1"
          >
            <Card className="h-full border border-border bg-card transition-all group-hover:border-primary/50 group-hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                  {tool.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {tool.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}

export default App;
