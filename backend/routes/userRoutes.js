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
    const owner = parseOwnerCredentials(req.body);

    if (!payload.codechef && !payload.codeforces && !payload.leetcode) {
      throw createHttpError(400, "Submit at least one platform username.");
    }

    await validateSubmittedProfiles(payload);

    const duplicate = await User.findOne(buildDuplicateQuery(payload));

    if (duplicate) {
      throw createHttpError(409, "This platform username combination already exists.");
    }

    const ownerSecretSalt = crypto.randomBytes(16).toString("hex");
    const user = new User({
      ...payload,
      ownerName: owner.name,
      ownerSecretHash: hashOwnerSecret(owner.secret, ownerSecretSalt),
      ownerSecretSalt,
    });
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

    const owner = parseOwnerCredentials({
      ownerName: req.get("x-owner-name"),
      ownerSecret: req.get("x-owner-secret"),
    });

    const user = await User.findById(req.params.id).select("+ownerName +ownerSecretHash +ownerSecretSalt");

    if (!user) {
      throw createHttpError(404, "User entry not found.");
    }

    const submittedHash = hashOwnerSecret(owner.secret, user.ownerSecretSalt);

    if (user.ownerName !== owner.name || !safeCompare(user.ownerSecretHash, submittedHash)) {
      throw createHttpError(403, "Only the person who added this user can delete it.");
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

function parseOwnerCredentials(source) {
  const name = normalizeOwnerName(source.ownerName);
  const secret = String(source.ownerSecret || "").trim();

  if (!name) {
    throw createHttpError(400, "Enter your name to own and later delete this leaderboard entry.");
  }

  if (secret.length < 4) {
    throw createHttpError(400, "Enter a deletion PIN with at least 4 characters.");
  }

  return { name, secret };
}

function normalizeOwnerName(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function hashOwnerSecret(secret, salt) {
  return crypto.createHash("sha256").update(`${salt}:${secret}`).digest("hex");
}

function safeCompare(left, right) {
  if (!left || !right || left.length !== right.length) return false;
  return crypto.timingSafeEqual(Buffer.from(left), Buffer.from(right));
}
