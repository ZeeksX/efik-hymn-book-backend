import Category from './category.model';
import Hymn from '../hymns/hymn.model';
import { NotFoundError } from '../../shared/errors';

export const listCategories = async () => {
  const categories = await Category.find({}).sort({ order: 1, name: 1 }).lean();
  return categories.map((category) => ({
    id: String(category._id),
    name: category.name,
    slug: category.slug,
    description: category.description,
    order: category.order,
  }));
};

export const getCategoryBySlug = async (slug: string) => {
  const category = await Category.findOne({ slug }).lean();

  if (!category) {
    throw new NotFoundError('Category not found.', 'CATEGORY_NOT_FOUND');
  }

  const hymnCount = await Hymn.countDocuments({ category: category._id, status: 'published' });

  return {
    id: String(category._id),
    name: category.name,
    slug: category.slug,
    description: category.description,
    order: category.order,
    hymnCount,
  };
};

export const getCategoryHymns = async (slug: string) => {
  const category = await Category.findOne({ slug });

  if (!category) {
    throw new NotFoundError('Category not found.', 'CATEGORY_NOT_FOUND');
  }

  return Hymn.find({ category: category._id, status: 'published' })
    .sort({ number: 1 })
    .select('number title slug category')
    .lean();
};
