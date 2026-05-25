import { Router } from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import User from "../models/User.js";
import { scrapeCodeChefProfile } from "../scrapers/codechefScraper.js";
import { fetchCodeforcesProfile } from "../scrapers/codeforcesScraper.js";
import { fetchLeetCodeProfile } from "../scrapers/leetcodeScraper.js";
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

    await validateSubmittedProfiles(payload);

    const duplicate = await User.findOne(buildDuplicateQuery(payload));

    if (duplicate) {
      throw createHttpError(409, "This platform username combination already exists.");
    }

    const deleteToken = crypto.randomBytes(32).toString("hex");
    const user = new User({
      ...payload,
      deleteTokenHash: hashDeleteToken(deleteToken),
    });
    const savedUser = await user.save();

    res.status(201).json({
      message: "User added.",
      user: savedUser,
      deleteToken,
    });
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw createHttpError(400, "Invalid user id.");
    }

    const deleteToken = req.get("x-delete-token");

    if (!deleteToken) {
      throw createHttpError(403, "Only the browser that added this user can delete it.");
    }

    const user = await User.findById(req.params.id).select("+deleteTokenHash");

    if (!user) {
      throw createHttpError(404, "User entry not found.");
    }

    if (!user.deleteTokenHash || user.deleteTokenHash !== hashDeleteToken(deleteToken)) {
      throw createHttpError(403, "Only the browser that added this user can delete it.");
    }

    const deleted = await User.findByIdAndDelete(req.params.id);

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

function hashDeleteToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

async function validateSubmittedProfiles(payload) {
  const checks = [
    payload.codechef && ["CodeChef", () => scrapeCodeChefProfile(payload.codechef)],
    payload.codeforces && ["Codeforces", () => fetchCodeforcesProfile(payload.codeforces)],
    payload.leetcode && ["LeetCode", () => fetchLeetCodeProfile(payload.leetcode)],
  ].filter(Boolean);

  const results = await Promise.allSettled(checks.map(([, check]) => check()));
  const failures = results
    .map((result, index) => ({ result, platform: checks[index][0] }))
    .filter(({ result }) => result.status === "rejected");

  if (!failures.length) return;

  const missingProfiles = failures.filter(({ result }) => result.reason?.statusCode === 404);
  if (missingProfiles.length) {
    throw createHttpError(
      400,
      missingProfiles.map(({ result }) => result.reason.message).join(" "),
    );
  }

  throw createHttpError(
    502,
    failures
      .map(({ platform, result }) => `${platform}: ${result.reason?.message || "Unable to verify username."}`)
      .join(" "),
  );
}
