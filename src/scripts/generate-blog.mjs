import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_PATH = path.join(__dirname, "../data/blog");
const REVIEW_PATH = path.join(__dirname, "../data/reviews");

const chatgptClient = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 180000,
  maxRetries: 2,
}) : null;

const siliconFlowClient = new OpenAI({
  apiKey: process.env.SILICONFLOW_API_KEY || "sk-demamdawlghvidlnlsktlknnxmrrbesvnkrjgamlacoosfdx",
  baseURL: "https://api.siliconflow.cn/v1",
  timeout: 180000,
  maxRetries: 2,
});

let currentClient = chatgptClient || siliconFlowClient;
let currentModel = chatgptClient ? "gpt-4o" : "Qwen/Qwen2.5-72B-Instruct";
let usingBackup = !chatgptClient;

function switchToBackup() {
  if (!usingBackup) {
    console.log("  ⚠️  Switching to SiliconFlow API (backup)...");
    currentClient = siliconFlowClient;
    currentModel = "Qwen/Qwen2.5-72B-Instruct";
    usingBackup = true;
  }
}

async function callAI(messages, model = currentModel) {
  const client = currentClient;
  const chatCompletion = await client.chat.completions.create({
    messages: messages,
    model: model,
    temperature: 0.7,
    max_tokens: 4096,
    presence_penalty: 0.1,
    frequency_penalty: 0.1,
  });
  return chatCompletion.choices[0].message.content;
}

async function generateTopicMetadata(topic) {
  console.log("  📝 Generating metadata...");
  const prompt = `
    You are an SEO expert and content strategist. Given the topic: "${topic}"
    
    Please provide:
    1. A catchy, SEO-friendly title (under 60 characters)
    2. A concise meta description (under 160 characters)
    3. 5-8 relevant tags (comma separated)
    4. Primary category (one of: compare, review, how-to, feature, cost, news)
    
    Format your response as JSON with these keys: title, description, tags, category
  `;

  try {
    const result = await callAI([{ role: "user", content: prompt }]);
    const metadata = JSON.parse(result);
    return metadata;
  } catch (error) {
    console.log("  ❌ Error:", error.message);
    switchToBackup();
    return generateTopicMetadata(topic);
  }
}

async function generateArticle(topic, metadata) {
  console.log("  📄 Generating article...");
  const prompt = `
    You are an expert writer for ServiceToolBase, a website that helps contractors find the best software solutions.
    
    Write a comprehensive article about "${topic}" following this structure:
    
    1. Introduction - Hook the reader with a compelling opening
    2. Problem Analysis - Why would someone look for alternatives?
    3. Solution Comparison - Compare 5-7 alternatives with:
       - Key features
       - Pricing
       - Screenshot description
       - Best for
    4. FAQ section - Answer common questions (cover long-tail keywords)
    5. Conclusion with clear CTA
    
    Requirements:
    - At least 2000 words
    - SEO-friendly with proper headings (H2, H3)
    - Include pricing tables
    - Use markdown format
    - Target audience: contractors, small business owners
    - Professional yet approachable tone
    
    Article Title: ${metadata.title}
  `;

  try {
    const result = await callAI([{ role: "user", content: prompt }]);
    return result;
  } catch (error) {
    console.log("  ❌ Error:", error.message);
    switchToBackup();
    return generateArticle(topic, metadata);
  }
}

async function reviewArticle(article, topic) {
  console.log("  🔍 Reviewing article...");
  const prompt = `
    You are a content quality reviewer for ServiceToolBase. Review the following article about "${topic}" against these criteria:
    
    1. Authenticity (25 points) - Is the information accurate and reliable?
    2. Audience Fit (20 points) - Does it address the target audience's needs?
    3. Argument Coherence (20 points) - Is the structure logical and well-organized?
    4. Information Delta (20 points) - Does it provide new/valuable information?
    5. CTA Quality (15 points) - Is there a clear call-to-action?
    
    Provide your review as JSON with:
    - scores: object with the 5 criteria and their scores (0-100 scale)
    - total: overall score
    - passed: boolean (pass if total >= 70 and all individual scores >= 70% of max)
    - feedback: brief improvement suggestions
    
    Article to review:
    ${article.substring(0, 5000)}
  `;

  try {
    const result = await callAI([{ role: "user", content: prompt }]);
    const review = JSON.parse(result);
    return review;
  } catch (error) {
    console.log("  ❌ Error:", error.message);
    switchToBackup();
    return reviewArticle(article, topic);
  }
}

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function formatMarkdown(article, metadata) {
  const frontmatter = `---
title: "${metadata.title}"
pubDatetime: ${new Date().toISOString()}
category: ${metadata.category}
draft: false
tags:
${metadata.tags.split(',').map(tag => `  - ${tag.trim()}`).join('\n')}
description: "${metadata.description}"
---

`;
  return frontmatter + article;
}

async function processTopic(topic) {
  const slug = slugify(topic);
  const metadata = await generateTopicMetadata(topic);
  const article = await generateArticle(topic, metadata);
  const review = await reviewArticle(article, topic);
  
  const markdownContent = formatMarkdown(article, metadata);
  const blogPath = path.join(BLOG_PATH, `${slug}.md`);
  const reviewPath = path.join(REVIEW_PATH, `${slug}-review.json`);
  
  fs.writeFileSync(blogPath, markdownContent);
  fs.writeFileSync(reviewPath, JSON.stringify(review, null, 2));
  
  return { slug, review };
}

async function main() {
  console.log("🚀 Starting article generation with AI review...\n");
  
  const topics = [
    "housecall pro alternatives",
  ];
  
  console.log(`📋 Topics: ${topics.length}\n`);
  
  const results = [];
  for (let i = 0; i < topics.length; i++) {
    console.log(`[${i + 1}/${topics.length}] Processing: ${topics[i]}`);
    try {
      const { slug, review } = await processTopic(topics[i]);
      results.push({ topic: topics[i], slug, review });
      console.log(`  ✅ Completed with score: ${review.total}/100`);
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      results.push({ topic: topics[i], error: error.message });
    }
    console.log();
  }
  
  console.log("==================================================");
  console.log("✅ All done!\n");
  console.log("📁 Generated files:");
  console.log("   - src/data/blog/     ← Article markdown files");
  console.log("   - src/data/reviews/  ← AI review reports (JSON)\n");
  
  console.log("📊 ServiceToolBase Review Criteria (Total: 100 pts, Pass: 70+ with all passing scores):");
  console.log("   • Authenticity (25 pts) - Passing: 18+");
  console.log("   • Audience Fit (20 pts) - Passing: 14+");
  console.log("   • Argument Coherence (20 pts) - Passing: 14+");
  console.log("   • Information Delta (20 pts) - Passing: 14+");
  console.log("   • CTA Quality (15 pts) - Passing: 10+\n");
  
  console.log("📝 Manual override:");
  console.log("   • Open src/data/blog/xxx.md");
  console.log("   • Change draft: true/false manually if needed");
}

main().catch(console.error);
