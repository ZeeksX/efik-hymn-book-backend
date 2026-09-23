import mongoose, { Schema, model, type InferSchemaType } from 'mongoose';

const verseSchema = new Schema(
  {
    number: { type: Number, required: true, min: 1 },
    lines: [{ type: String, required: true }],
  },
  { _id: false },
);

const chorusSchema = new Schema(
  {
    label: { type: String },
    lines: [{ type: String, required: true }],
  },
  { _id: false },
);

const hymnSchema = new Schema(
  {
    number: { type: Number, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true, index: true },
    alternateTitle: { type: String },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    verses: [verseSchema],
    chorus: chorusSchema,
    tags: [{ type: String, lowercase: true }],
    language: { type: String, enum: ['efik'], default: 'efik' },
    translation: {
      language: { type: String, enum: ['en'] },
      title: { type: String },
      verses: [verseSchema],
      chorus: {
        label: { type: String },
        lines: [{ type: String }],
      },
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    metadata: {
      author: { type: String },
      composer: { type: String },
      source: { type: String },
      year: { type: Number },
    },
    searchTitle: { type: String, index: true },
    searchText: { type: String, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

hymnSchema.index({ category: 1, status: 1, number: 1 });
hymnSchema.index({ title: 1 });

export type HymnDocument = InferSchemaType<typeof hymnSchema> & {
  _id: mongoose.Types.ObjectId;
};

const Hymn = model<HymnDocument>('Hymn', hymnSchema);

export default Hymn;
