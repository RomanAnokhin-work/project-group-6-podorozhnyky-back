import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    articlesAmount: {
      type: Number,
      default: 0,
    },
    savedArticles: [{
      type: Schema.Types.ObjectId,
      ref: 'Articles',
    }]
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

export const User = mongoose.model('User', userSchema);
