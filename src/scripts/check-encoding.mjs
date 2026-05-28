/**
 * 构建前编码检查脚本
 * 在构建前自动检查所有博客文章的编码问题
 * 如果发现问题，自动修复并警告
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { autoFixEncoding } from "./utils/encoding.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_PATH = path.join(__dirname, "../data/blog");

/**
 * 检查并修复单个文件的编码问题
 * @param {string} filePath - 文件路径
 * @returns {boolean} - 是否发现问题
 */
function checkAndFixFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const result = autoFixEncoding(content);
    
    if (result.changed) {
      const fileName = path.basename(filePath);
      console.log(`⚠️  ${fileName}: Found ${result.changes} encoding issue(s), auto-fixed`);
      fs.writeFileSync(filePath, result.content, { encoding: "utf8" });
      return true;
    }
    
    return false;
  } catch (error) {
    console.log(`❌ Error processing ${path.basename(filePath)}: ${error.message}`);
    return false;
  }
}

/**
 * 检查所有博客文章的编码
 * @returns {Object} - 检查结果
 */
function checkAllFiles() {
  console.log("🔤 Running encoding check for all blog posts...\n");
  
  const files = fs.readdirSync(BLOG_PATH).filter(f => f.endsWith(".md"));
  let filesWithIssues = 0;
  let totalChanges = 0;
  
  for (const file of files) {
    const filePath = path.join(BLOG_PATH, file);
    const hadIssues = checkAndFixFile(filePath);
    if (hadIssues) {
      filesWithIssues++;
    }
  }
  
  console.log("\n==================================================");
  console.log(`✅ Encoding check completed`);
  console.log(`   - Files checked: ${files.length}`);
  console.log(`   - Files with issues: ${filesWithIssues}`);
  
  // 如果发现问题，返回失败状态码
  if (filesWithIssues > 0) {
    console.log("\n⚠️  Warning: Some files had encoding issues that were automatically fixed.");
    process.exitCode = 1;
  } else {
    console.log("\n✅ All files are properly encoded!");
  }
  
  return {
    filesChecked: files.length,
    filesWithIssues,
    totalChanges
  };
}

// 如果直接运行此脚本，则执行检查
if (import.meta.url.startsWith("file://")) {
  checkAllFiles();
}

export { checkAllFiles };
