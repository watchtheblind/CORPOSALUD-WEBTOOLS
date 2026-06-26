import {FilterCategory, ToolCard} from '@/types/filter.types';

export const FILTER_CATEGORIES: FilterCategory[] = [
  {id: 'todos', label: 'Todos'},
  {id: 'pdf-organizar', label: 'Organizar PDF'},
  {id: 'pdf-convertir', label: 'Convertir de PDF'},
  {id: 'pdf-crear', label: 'Convertir a PDF'},
];

export const TOOLS_DATA: ToolCard[] = [
  {
    id: 1,
    title: 'Unir PDF',
    category: 'pdf-organizar',
    description:
      'Une varios archivos PDF en un solo documento de forma rápida.',
    href: '/unir-pdf',
  },
  {
    id: 2,
    title: 'Dividir PDF',
    category: 'pdf-organizar',
    description: 'Extrae una o varias páginas de tu archivo PDF.',
    href: '/dividir-pdf',
  },
  {
    id: 3,
    title: 'PDF a JPG',
    category: 'pdf-convertir',
    description: 'Extrae todas las imágenes de un PDF o conviértelo a JPG.',
    href: '/pdf-a-jpg',
  },
  {
    id: 4,
    title: 'JPG a PDF',
    category: 'pdf-crear',
    description: 'Convierte tus imágenes JPG a un documento PDF en segundos.',
    href: '/jpg-a-pdf',
  },
];
