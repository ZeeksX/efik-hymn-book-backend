import Category from '../categories/category.model';
import Hymn from './hymn.model';
import { NotFoundError } from '../../shared/errors';
import { normalizeSearchText, slugify } from '../../shared/utils/normalize';

interface ListHymnFilters {
  page: number;
  limit: number;
  category?: string;
  letter?: string;
  sort: 'number' | 'title' | 'createdAt' | 'updatedAt';
  order: 'asc' | 'desc';
}

const buildHymnListQuery = async (filters: ListHymnFilters) => {
  const query: Record<string, unknown> = { status: 'published' };

  if (filters.category) {
    const category = await Category.findOne({ slug: filters.category }).select('_id');
    if (category) {
      query.category = category._id;
    }
  }

  if (filters.letter) {
    query.title = { $regex: `^${filters.letter}`, $options: 'i' };
  }

  return query;
};

export const listHymns = async (filters: ListHymnFilters) => {
  const query = await buildHymnListQuery(filters);
  const sortField = filters.sort === 'title' ? 'title' : filters.sort;
  const sortDirection = filters.order === 'desc' ? -1 : 1;

  const [items, total] = await Promise.all([
    Hymn.find(query)
      .sort({ [sortField]: sortDirection, number: 1 })
      .skip((filters.page - 1) * filters.limit)
      .limit(filters.limit)
      .select('number title slug category tags verses')
      .lean(),
    Hymn.countDocuments(query),
  ]);

  return {
    items: items.map((hymn) => ({
      id: String(hymn._id),
      number: hymn.number,
      title: hymn.title,
      slug: hymn.slug,
      category: hymn.category,
      tags: hymn.tags,
      firstLine: hymn.verses?.[0]?.lines?.[0] ?? '',
    })),
    meta: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    },
  };
};

export const getHymnByNumber = async (number: number) => {
  const hymn = await Hymn.findOne({ number, status: 'published' }).populate('category', 'name slug').lean();

  if (!hymn) {
    throw new NotFoundError('The requested hymn could not be found.', 'HYMN_NOT_FOUND');
  }

  return {
    id: String(hymn._id),
    number: hymn.number,
    title: hymn.title,
    slug: hymn.slug,
    alternateTitle: hymn.alternateTitle,
    category: hymn.category,
    verses: hymn.verses,
    chorus: hymn.chorus,
    tags: hymn.tags,
    language: hymn.language,
    translation: hymn.translation,
    metadata: hymn.metadata,
    status: hymn.status,
  };
};

export const getRandomHymn = async () => {
  const hymn = await Hymn.findOne({ status: 'published' }).sort({ number: 1 }).skip(Math.floor(Math.random() * (await Hymn.countDocuments({ status: 'published' })))) .lean();

  if (!hymn) {
    throw new NotFoundError('No published hymns are available.', 'HYMN_NOT_FOUND');
  }

  return getHymnByNumber(hymn.number);
};

export const relatedHymns = async (number: number) => {
  const current = await Hymn.findOne({ number }).select('_id category title').lean();
  if (!current) {
    throw new NotFoundError('The requested hymn could not be found.', 'HYMN_NOT_FOUND');
  }

  return Hymn.find({ category: current.category, status: 'published', _id: { $ne: current._id } })
    .sort({ number: 1 })
    .limit(5)
    .select('number title slug')
    .lean();
};

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const searchHymns = async (query: string) => {
  const normalized = normalizeSearchText(query).trim();
  if (!normalized) {
    return [];
  }

  const numberValue = Number(normalized);
  const conditions: Record<string, unknown>[] = [];

  if (Number.isFinite(numberValue)) {
    conditions.push({ number: numberValue, status: 'published' });
  }

  conditions.push({ searchTitle: normalized, status: 'published' });
  conditions.push({ searchTitle: { $regex: `^${escapeRegex(normalized)}`, $options: 'i' }, status: 'published' });
  conditions.push({ searchTitle: { $regex: escapeRegex(normalized), $options: 'i' }, status: 'published' });
  conditions.push({ searchText: { $regex: escapeRegex(normalized), $options: 'i' }, status: 'published' });
  conditions.push({ tags: { $regex: escapeRegex(normalized), $options: 'i' }, status: 'published' });

  const results = await Hymn.find({ $or: conditions }).sort({ number: 1 }).limit(20).lean();

  return results.map((hymn) => ({
    id: String(hymn._id),
    number: hymn.number,
    title: hymn.title,
    slug: hymn.slug,
    category: hymn.category,
    score: 1,
  }));
};

export const createHymn = async (payload: Record<string, unknown>, userId?: string) => {
  const category = await Category.findById(payload.category);
  if (!category) {
    throw new NotFoundError('Category not found.', 'CATEGORY_NOT_FOUND');
  }

  const title = String(payload.title ?? '');
  const number = Number(payload.number);
  const slug = slugify(`${number} ${title}`);

  const existing = await Hymn.findOne({ number });
  if (existing) {
    throw new Error('Hymn number already exists');
  }

  const hymn = await Hymn.create({
    ...payload,
    category: category._id,
    slug,
    searchTitle: normalizeSearchText(title),
    searchText: normalizeSearchText((payload.verses as Array<Record<string, unknown>> ?? []).map((verse) => (verse as Record<string, unknown>).lines ?? []).join(' ')),
    createdBy: userId,
    updatedBy: userId,
  });

  return hymn;
};
