import { Schema, model } from 'mongoose';

const travellerSchema = new Schema(
  {
    img: {
      type: String,
    },
    title: {
      type: String,
    },
    article: {
      type: String,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    date: {
      type: String,
    },
    favoriteCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Traveller = model('Traveller', travellerSchema);
