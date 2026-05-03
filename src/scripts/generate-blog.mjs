import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_PATH = path.join(__dirname, "../data/blog");
const REVIEW_PATH = path.join(__dirname, "../data/reviews");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.siliconflow.cn/v1",
  timeout: 120000,
  maxRetries: 3,
});

const TOPICS = [
  "housecall pro vs freshbooks",
];

const CATEGORIES = ["reviews", "compare", "hub", "pricing"];

function parseJSON(str) {
  let cleaned = str.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```json\n?/, "").replace(/\n?```$/, "");
  }
  return JSON.parse(cleaned);
}

async function generateTopicMetadata(keyword) {
  const response = await client.chat.completions.create({
    model: "Qwen/Qwen2.5-72B-Instruct",
    messages: [
      {
        role: "system",
        content: `You are a blog strategist. Based on the keyword, generate article metadata in JSON format only.
Output exactly this JSON structure, no other text:
{
  "title": "SEO-friendly English title with year 2026",
  "category": "one of these: reviews, compare, hub, pricing",
  "tags": ["tag1", "tag2", "tag3"],
  "description": "Under 160 characters description"
}`,
      },
      {
        role: "user",
        content: `Generate metadata for an article about: ${keyword}`,
      },
    ],
    temperature: 0.7,
  });

  return parseJSON(response.choices[0].message.content);
}

async function generateArticle(metadata, keyword) {
  const response = await client.chat.completions.create({
    model: "Qwen/Qwen2.5-72B-Instruct",
    messages: [
      {
        role: "system",
        content: `You are a professional technical writer for field service industry blogs. Generate markdown content following this exact format:

---
title: "Article Title"
pubDatetime: YYYY-MM-DDTHH:MM:SSZ
category: reviews|compare|hub|pricing
draft: true
tags:
  - Tag1
  - Tag2
description: "A brief description under 160 characters"
---

# Article Title

[Article body in English, 1000-1500 words, professional but accessible tone, no tables, pure paragraphs]`,
      },
      {
        role: "user",
        content: `Write a comprehensive article about: ${keyword}

Title: ${metadata.title}
Category: ${metadata.category}
Tags: ${metadata.tags.join(", ")}
Description: ${metadata.description}

Make sure the article is helpful, specific, and provides real value to readers who are small HVAC, plumbing, or electrical contractors.`,
      },
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content;
}

async function reviewArticle(articleContent, keyword) {
  const response = await client.chat.completions.create({
    model: "Qwen/Qwen2.5-72B-Instruct",
    messages: [
      {
        role: "system",
        content: `You are an expert content evaluator for ServiceToolBase, a site dedicated to providing honest, BS-free software reviews for US-based blue-collar service businesses (HVAC, plumbing, electrical, 1-10 person crews).

Your task is to evaluate the provided article based on 5 strict criteria. You must output a JSON object containing the scores and feedback.

Evaluation Criteria

1. Authenticity (Max 25 points)
- Are data, cases, and quotes verifiable? (e.g., links to Reddit, G2, official pricing pages)
- Deduct 8 points for any obviously fake or vague cases (e.g., "My client in Texas").
- Add 5 points for each verifiable data point or direct quote with a source.
- Passing score: 18

2. Audience Fit (Max 20 points)
- Does it speak directly to a blue-collar owner-operator?
- Deduct 3 points for each use of corporate jargon, MBA speak, or abstract advice ("optimize your workflow").
- Add points for realistic scenarios (trucks, job sites, busy seasons).
- Passing score: 14

3. Argument Coherence (Max 20 points)
- Does the article deliver on the promise of its title?
- Does it maintain its core thesis throughout without drifting into a generic review?
- Does it make a clear, opinionated verdict (who it's for / who it's not for)?
- Passing score: 14

4. Information Delta (Max 20 points)
- Does it provide information not found in generic top 5 Google results?
- Add 5 points for exposing hidden fees, specific feature limitations, or operational gotchas.
- Passing score: 14

5. Call to Action Quality (Max 15 points)
- Is the next step specific and actionable? (e.g., "Open an incognito window and test your booking link" vs "Consider upgrading").
- Add 8 points for highly specific, verifiable action steps.
- Passing score: 10

Output Format

You MUST return ONLY a valid JSON object with the following structure:
{
"scores": {
"authenticity": <int>,
"audience_fit": <int>,
"argument_coherence": <int>,
"information_delta": <int>,
"cta_quality": <int>
},
"total_score": <int>,
"passed": <boolean>,
"feedback": {
"authenticity": "<string>",
"audience_fit": "<string>",
"argument_coherence": "<string>",
"information_delta": "<string>",
"cta_quality": "<string>"
},
"critical_issues": ["<string>", "<string>"]
}`,
      },
      {
        role: "user",
        content: `Review this article about ${keyword}:\n\n${articleContent}`,
      },
    ],
    temperature: 0.3,
  });

  return parseJSON(response.choices[0].message.content);
}

function saveArticle(content, filename) {
  if (!fs.existsSync(BLOG_PATH)) {
    fs.mkdirSync(BLOG_PATH, { recursive: true });
  }
  const filePath = path.join(BLOG_PATH, filename);
  fs.writeFileSync(filePath, content);
  console.log(`  ✓ Saved: ${filename}`);
}

function saveReview(review, filename) {
  if (!fs.existsSync(REVIEW_PATH)) {
    fs.mkdirSync(REVIEW_PATH, { recursive: true });
  }
  const reviewFilename = filename.replace(".md", "-review.json");
  const filePath = path.join(REVIEW_PATH, reviewFilename);
  fs.writeFileSync(filePath, JSON.stringify(review, null, 2));
  console.log(`  ✓ Review saved: ${reviewFilename}`);
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ Please set OPENAI_API_KEY environment variable");
    console.log('   Run: export OPENAI_API_KEY="your-key-here"');
    process.exit(1);
  }

  console.log("🚀 Starting article generation with AI review...\n");
  console.log(`📋 Topics: ${TOPICS.length}\n`);

  for (let i = 0; i < TOPICS.length; i++) {
    const keyword = TOPICS[i];
    console.log(`\n[${i + 1}/${TOPICS.length}] Processing: ${keyword}`);

    try {
      console.log("  � Generating metadata...");
      const metadata = await generateTopicMetadata(keyword);
      console.log(`     Title: ${metadata.title}`);
      console.log(`     Category: ${metadata.category}`);

      console.log("  ✍️  Generating article...");
      const articleContent = await generateArticle(metadata, keyword);

      console.log("  🔍 AI Review...");
      const review = await reviewArticle(articleContent, keyword);
      console.log(`     Total Score: ${review.total_score}/100`);
      console.log(`     Passed: ${review.passed}`);
      console.log(`     Scores: Authenticity=${review.scores.authenticity}/25, Audience=${review.scores.audience_fit}/20, Coherence=${review.scores.argument_coherence}/20, Delta=${review.scores.information_delta}/20, CTA=${review.scores.cta_quality}/15`);

      const shouldPublish = review.passed === true;
      const finalContent = shouldPublish
        ? articleContent.replace("draft: true", "draft: false")
        : articleContent;

      if (shouldPublish) {
        console.log("     📢 Will auto-publish (passed all criteria)");
      } else {
        console.log("     📝 Saved as draft (failed criteria)");
        if (review.critical_issues.length > 0) {
          console.log(`     Critical issues: ${review.critical_issues.join(", ")}`);
        }
      }

      const filename = `${slugify(metadata.title)}.md`;
      saveArticle(finalContent, filename);
      saveReview(review, filename);

      console.log("  ✅ Complete!");

      if (i < TOPICS.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("✅ All done!");
  console.log("\n📁 Generated files:");
  console.log("   - src/data/blog/     ← Article markdown files");
  console.log("   - src/data/reviews/  ← AI review reports (JSON)");
  console.log("\n� ServiceToolBase Review Criteria (Total: 100 pts, Pass: 70+ with all passing scores):");
  console.log("   • Authenticity (25 pts) - Passing: 18+");
  console.log("   • Audience Fit (20 pts) - Passing: 14+");
  console.log("   • Argument Coherence (20 pts) - Passing: 14+");
  console.log("   • Information Delta (20 pts) - Passing: 14+");
  console.log("   • CTA Quality (15 pts) - Passing: 10+");
  console.log("\n📝 Manual override:");
  console.log("   • Open src/data/blog/xxx.md");
  console.log("   • Change draft: true/false manually if needed");
}

main();