import { Router } from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createHttpError } from "../utils/httpError.js";
import { assertOptionalUsername } from "../utils/validators.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const users = await User.find().sort({ createdAt: -1 });

    res.json({
      count: users.length,
      users,
    });
  }),
);

router.post(
  "/add",
  asyncHandler(async (req, res) => {
    const payload = {
      codechef: assertOptionalUsername(req.body.codechef, "CodeChef username"),
      codeforces: assertOptionalUsername(req.body.codeforces, "Codeforces username"),
      leetcode: assertOptionalUsername(req.body.leetcode, "LeetCode username"),
    };

    if (!payload.codechef && !payload.codeforces && !payload.leetcode) {
      throw createHttpError(400, "Submit at least one platform username.");
    }

    const duplicate = await User.findOne(buildDuplicateQuery(payload));

    if (duplicate) {
      throw createHttpError(409, "This platform username combination already exists.");
    }

    const user = new User(payload);
    const savedUser = await user.save();

    res.status(201).json({
      message: "User added.",
      user: savedUser,
    });
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw createHttpError(400, "Invalid user id.");
    }

    const deleted = await User.findByIdAndDelete(req.params.id);

    if (!deleted) {
      throw createHttpError(404, "User entry not found.");
    }

    res.json({
      message: "User deleted.",
      user: deleted,
    });
  }),
);

export default router;

function buildDuplicateQuery(payload) {
  return {
    codechef: exactHandleMatcher(payload.codechef),
    codeforces: exactHandleMatcher(payload.codeforces),
    leetcode: exactHandleMatcher(payload.leetcode),
  };
}

function exactHandleMatcher(value) {
  if (!value) return "";
  return new RegExp(`^${escapeRegExp(value)}$`, "i");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
