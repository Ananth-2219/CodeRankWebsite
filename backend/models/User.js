import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    codechef: {
      type: String,
      trim: true,
      default: "",
    },
    codeforces: {
      type: String,
      trim: true,
      default: "",
    },
    leetcode: {
      type: String,
      trim: true,
      default: "",
    },
    totalScore: {
      type: Number,
      default: 0,
    },
    scoreBreakdown: {
      type: Object,
      default: {},
    },
    ownerName: {
      type: String,
      default: "",
      select: false,
    },
    ownerSecretHash: {
      type: String,
      default: "",
      select: false,
    },
    ownerSecretSalt: {
      type: String,
      default: "",
      select: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    minimize: false,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.ownerName;
        delete ret.ownerSecretHash;
        delete ret.ownerSecretSalt;
        return ret;
      },
    },
  },
);

userSchema.index(
  {
    codechef: 1,
    codeforces: 1,
    leetcode: 1,
  },
  { unique: true },
);

const User = mongoose.model("User", userSchema);

export default User;
