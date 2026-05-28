import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_PATH = path.join(__dirname, "../data/blog");

// 常见的编码问题映射表
// 这些是 UTF-8 字符被错误解释为其他编码（如 Windows-1252）后又被当作 UTF-8 读取的结果
const encodingFixes = [
  // 智能引号和撇号 (Windows-1252 misinterpreted as UTF-8)
  [/\u00E2\u20AC\u2122/g, "'"],   // â€™ -> ' (右单引号)
  [/\u00E2\u20AC\u201D/g, '"'],   // â€\" -> " (右双引号)
  [/\u00E2\u20AC\u201C/g, '"'],   // â€œ -> " (左双引号)
  [/\u00E2\u20AC\u2018/g, "'"],   // â€˜ -> ' (左单引号)
  [/\u00E2\u20AC\u2019/g, "'"],   // â€™ -> ' (右单引号)
  
  // 连字符和破折号
  [/\u00E2\u20AC\u2013/g, "-"],   // â€" -> - (短破折号)
  [/\u00E2\u20AC\u2014/g, "--"],  // â€" -> -- (长破折号)
  
  // 省略号
  [/\u00E2\u20AC\u2026/g, "..."], // â€¦ -> ... (省略号)
  
  // 商标符号
  [/\u00E2\u20AC\u2122/g, "(TM)"], // â„¢ -> (TM)
  
  // 版权符号
  [/\u00C2\u00A9/g, "(C)"],       // Â© -> (C)
  
  // 注册商标符号
  [/\u00C2\u00AE/g, "(R)"],       // Â® -> (R)
  
  // 特殊撇号问题
  [/\u00C2\u2019/g, "'"],         // Â’ -> '
  
  // 更多常见问题
  [/\u00C3\u00A2\u00C2\u20AC\u00C2\u2122/g, "'"],  // Ã¢â‚¬â„¢ -> '
  [/\u00C3\u00A2\u00C2\u20AC\u00C2\u2019/g, "'"],  // Ã¢â‚¬â„¢ -> '
  
  // UTF-16 编码问题
  [/\uFFFD/g, "'"],                // � -> ' (替换字符)
  
  // 直接的 UTF-8 特殊字符
  [/\u2019/g, "'"],               // ’ -> ' (右单引号)
  [/\u2018/g, "'"],               // ‘ -> ' (左单引号)
  [/\u201C/g, '"'],               // “ -> " (左双引号)
  [/\u201D/g, '"'],               // ” -> " (右双引号)
  [/\u2013/g, "-"],               // – -> - (短破折号)
  [/\u2014/g, "--"],              // — -> -- (长破折号)
  [/\u2026/g, "..."],             // … -> ... (省略号)
];

function detectEncodingIssues(content) {
  const issues = [];
  for (const [pattern, replacement] of encodingFixes) {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        pattern: pattern.toString(),
        replacement,
        count: matches.length
      });
    }
  }
  return issues;
}

function fixFileEncoding(filePath) {
  try {
    // 尝试用 UTF-8 读取文件
    let content = fs.readFileSync(filePath, "utf8");
    
    // 检测问题
    const issues = detectEncodingIssues(content);
    
    if (issues.length === 0) {
      console.log(`  No issues found in: ${path.basename(filePath)}`);
      return 0;
    }
    
    console.log(`  Found issues in: ${path.basename(filePath)}`);
    for (const issue of issues) {
      console.log(`    - Pattern: ${issue.pattern} -> "${issue.replacement}" (${issue.count} occurrences)`);
    }
    
    // 应用修复
    let changes = 0;
    for (const [pattern, replacement] of encodingFixes) {
      const matches = content.match(pattern);
      if (matches) {
        changes += matches.length;
        content = content.replace(pattern, replacement);
      }
    }
    
    // 使用正确的 UTF-8 编码写入文件
    fs.writeFileSync(filePath, content, { encoding: "utf8" });
    console.log(`    ✅ Fixed ${changes} issues\n`);
    
    return changes;
  } catch (error) {
    console.log(`  ❌ Error processing ${path.basename(filePath)}: ${error.message}\n`);
    return 0;
  }
}

function processAllFiles() {
  console.log("🚀 Starting encoding fix for all blog posts...\n");
  
  const files = fs.readdirSync(BLOG_PATH).filter(f => f.endsWith(".md"));
  let totalChanges = 0;
  let filesWithIssues = 0;
  
  for (const file of files) {
    const filePath = path.join(BLOG_PATH, file);
    const changes = fixFileEncoding(filePath);
    if (changes > 0) {
      filesWithIssues++;
    }
    totalChanges += changes;
  }
  
  console.log("==================================================");
  console.log(`✅ All done!`);
  console.log(`   - Files processed: ${files.length}`);
  console.log(`   - Files with issues: ${filesWithIssues}`);
  console.log(`   - Total encoding issues fixed: ${totalChanges}`);
}

processAllFiles();
