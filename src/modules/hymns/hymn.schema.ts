import { z } from 'zod';

export const hymnVerseSchema = z.object({
  number: z.number().int().positive(),
  lines: z.array(z.string().min(1)).min(1),
});

export const hymnCreateSchema = z.object({
  body: z.object({
    number: z.number().int().positive(),
    title: z.string().min(1),
    alternateTitle: z.string().optional(),
    category: z.string().min(1),
    verses: z.array(hymnVerseSchema).min(1),
    chorus: z
      .object({
        label: z.string().optional(),
        lines: z.array(z.string().min(1)).min(1),
      })
      .optional(),
    tags: z.array(z.string()).optional(),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
    metadata: z
      .object({
        author: z.string().optional(),
        composer: z.string().optional(),
        source: z.string().optional(),
        year: z.number().int().optional(),
      })
      .optional(),
  }),
});

export const hymnQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    category: z.string().optional(),
    letter: z.string().optional(),
    sort: z.enum(['number', 'title', 'createdAt', 'updatedAt']).default('number'),
    order: z.enum(['asc', 'desc']).default('asc'),
  }),
});

export const hymnNumberParamSchema = z.object({
  params: z.object({
    number: z.coerce.number().int().positive(),
  }),
});
