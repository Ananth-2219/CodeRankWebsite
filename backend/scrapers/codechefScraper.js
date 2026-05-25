import axios from "axios";
import * as cheerio from "cheerio";
import { createHttpError } from "../utils/httpError.js";
import { normalizeNumber, normalizeText } from "../utils/scoreUtils.js";

const CODECHEF_BASE_URL = "https://www.codechef.com/users";

export async function scrapeCodeChefProfile(username) {
  const url = `${CODECHEF_BASE_URL}/${encodeURIComponent(username)}`;

  let html;
  try {
    const response = await axios.get(url, {
      timeout: Number(process.env.REQUEST_TIMEOUT_MS) || 12000,
      headers: {
        "User-Agent": "Mozilla/5.0 CodingRankBot/1.0",
        Accept: "text/html,application/xhtml+xml",
      },
      validateStatus: (status) => status < 500,
    });

    if (response.status === 404) {
      throw createHttpError(404, `CodeChef profile '${username}' was not found.`);
    }

    if (response.status === 429) {
      throw createHttpError(429, "CodeChef rate limit reached. Try again later.");
    }

    if (response.status >= 400) {
      throw createHttpError(response.status, "CodeChef rejected the profile request.");
    }

    html = response.data;
  } catch (error) {
    if (error.statusCode) throw error;
    throw createHttpError(500, "Failed to fetch CodeChef profile.", error.message);
  }

  const $ = cheerio.load(html);

  const displayName = textFromFirst($, [
    ".user-details-container header h1",
    ".user-details-container h1",
    "h1",
  ]);

  if (!displayName && !$(".rating-number").length && !$(".rating-header").length) {
    throw createHttpError(
      404,
      `CodeChef profile '${username}' could not be parsed. The username may be invalid or the page structure changed.`,
    );
  }

  const rating = normalizeNumber(textFromFirst($, [".rating-number", ".rating-header .rating-number"]));
  const highestRating = extractHighestRating($);
  const stars = textFromFirst($, [".rating-star", ".rating-stars", ".star-dims"]);
  const ranks = extractRanks($);
  const problemsSolved = extractProblemsSolved($);
  const contestsAttended = extractContestsAttended($);
  const badges = extractBadges($);
  const badgeProgress = extractBadgeProgress($);

  return {
    username,
    displayName: normalizeText(displayName),
    platform: "CodeChef",
    rating,
    highestRating,
    stars,
    globalRank: ranks.globalRank,
    countryRank: ranks.countryRank,
    problemsSolved,
    contestsAttended,
    badges,
    badgeProgress,
  };
}

function textFromFirst($, selectors) {
  for (const selector of selectors) {
    const value = normalizeText($(selector).first().text());
    if (value) return value;
  }
  return "";
}

function extractHighestRating($) {
  const ratingHeaderText = normalizeText($(".rating-header").text());
  const match = ratingHeaderText.match(/highest\s+rating\D+(\d+)/i);
  return normalizeNumber(match?.[1]);
}

function extractRanks($) {
  const rankText = normalizeText($(".rating-ranks").text());
  const globalMatch = rankText.match(/global\s+rank\D+([\d,]+)/i);
  const countryMatch = rankText.match(/country\s+rank\D+([\d,]+)/i);

  return {
    globalRank: normalizeNumber(globalMatch?.[1]),
    countryRank: normalizeNumber(countryMatch?.[1]),
  };
}

function extractProblemsSolved($) {
  const candidates = [
    ".problems-solved h3",
    ".problems-solved",
    "section:contains('Total Problems Solved')",
    "body",
  ];

  for (const selector of candidates) {
    const text = normalizeText($(selector).first().text());
    const totalMatch = text.match(/total\s+problems\s+solved\D+([\d,]+)/i);
    const fullySolvedMatch = text.match(/fully\s+solved\D+([\d,]+)/i);
    const solvedMatch = text.match(/problems\s+solved\D+([\d,]+)/i);
    const value = normalizeNumber(totalMatch?.[1] || fullySolvedMatch?.[1] || solvedMatch?.[1]);
    if (value) return value;
  }

  return 0;
}

function extractContestsAttended($) {
  const text = normalizeText($("body").text());
  const directMatch = text.match(/contests?\s+attended\D+([\d,]+)/i);
  if (directMatch) return normalizeNumber(directMatch[1]);

  return $(".contest-name, .contest-participated, .rating-data-section .content a").length;
}

function extractBadges($) {
  const badges = new Set();

  // Prefer semantic attributes first; CodeChef often places the clean badge name in title/alt.
  $("[title*='Badge'], [alt*='Badge'], .badge, .user-badge, .badge-card").each((_, element) => {
    addBadge(badges, $(element).attr("title") || $(element).attr("alt") || $(element).text());
  });

  if (!badges.size) {
    // Fallback for future markup changes where badge labels are rendered as plain text.
    $("body")
      .text()
      .match(/[A-Z][A-Za-z\s]+-\s*(?:No|Bronze|Silver|Gold|Platinum|Diamond)\s+Badge/g)
      ?.forEach((badge) => addBadge(badges, badge));
  }

  return [...badges];
}

function addBadge(badges, rawBadge) {
  const badge = normalizeBadgeTitle(rawBadge);
  if (badge) badges.add(badge);
}

function normalizeBadgeTitle(rawBadge = "") {
  const text = normalizeText(rawBadge);
  const match = text.match(/([A-Za-z\s]+-\s*(?:No|Bronze|Silver|Gold|Platinum|Diamond)\s+Badge)/i);
  return match ? normalizeText(match[1]) : "";
}

function extractBadgeProgress($) {
  const progress = [];

  $(".badge, .user-badge, .badge-card, [class*='badge']").each((_, element) => {
    const label = normalizeText($(element).text() || $(element).attr("title"));
    const progressValue = normalizeText($(element).find("progress").attr("value") || $(element).attr("aria-valuenow"));

    if (label && progressValue) {
      progress.push({
        badge: label,
        value: normalizeNumber(progressValue),
      });
    }
  });

  return progress;
}
