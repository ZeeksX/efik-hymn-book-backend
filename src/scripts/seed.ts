import argon2 from 'argon2';
import { connectDatabase } from '../config/database';
import Category from '../modules/categories/category.model';
import User from '../modules/users/user.model';
import Hymn from '../modules/hymns/hymn.model';
import { env } from '../config/env';

const seed = async (): Promise<void> => {
  if (env.NODE_ENV === 'production') {
    throw new Error('The seed script must not run in production.');
  }

  await connectDatabase();

  await User.deleteMany({});
  await Category.deleteMany({});
  await Hymn.deleteMany({});

  const adminPasswordHash = await argon2.hash('Admin123!');
  const editorPasswordHash = await argon2.hash('Editor123!');

  const admin = await User.create({
    name: 'System Admin',
    email: 'admin@efik.local',
    emailNormalized: 'admin@efik.local',
    passwordHash: adminPasswordHash,
    role: 'admin',
    status: 'active',
    emailVerified: true,
  });

  await User.create({
    name: 'Editor User',
    email: 'editor@efik.local',
    emailNormalized: 'editor@efik.local',
    passwordHash: editorPasswordHash,
    role: 'editor',
    status: 'active',
    emailVerified: true,
  });

  const categories = await Category.insertMany([
    { name: 'Praise', slug: 'praise', description: 'Songs of praise and thanksgiving.', order: 1 },
    { name: 'Worship', slug: 'worship', description: 'Worship-focused hymns.', order: 2 },
    { name: 'Prayer', slug: 'prayer', description: 'Prayerful hymns.', order: 3 },
    { name: 'Children', slug: 'children', description: 'Hymns for children.', order: 4 },
  ]);

  const praiseCategory = categories[0];

  await Hymn.insertMany([
    {
      number: 1,
      title: 'Abasi',
      slug: '1-abasi',
      category: praiseCategory._id,
      verses: [{ number: 1, lines: ['Abasi, emi nte ke', 'Abasi, emi nte ke'] }],
      tags: ['praise', 'worship'],
      status: 'published',
      searchTitle: 'abasi',
      searchText: 'abasi emi nte ke',
      createdBy: admin._id,
      updatedBy: admin._id,
    },
    {
      number: 2,
      title: 'Nyin Edi',
      slug: '2-nyin-edi',
      category: praiseCategory._id,
      verses: [{ number: 1, lines: ['Nyin edi, Nyin edi', 'Nyin edi, Nyin edi'] }],
      tags: ['praise'],
      status: 'published',
      searchTitle: 'nyin edi',
      searchText: 'nyin edi nyin edi',
      createdBy: admin._id,
      updatedBy: admin._id,
    },
    {
      number: 3,
      title: 'Prayer of the Saints',
      slug: '3-prayer-of-the-saints',
      category: categories[2]._id,
      verses: [{ number: 1, lines: ['We pray to the Lord', 'We lift our voices'] }],
      tags: ['prayer'],
      status: 'draft',
      searchTitle: 'prayer of the saints',
      searchText: 'we pray to the lord we lift our voices',
      createdBy: admin._id,
      updatedBy: admin._id,
    },
  ]);

  console.log('Seeded development data successfully.');
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
