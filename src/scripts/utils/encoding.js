/**
 * 编码处理工具模块
 * 自动检测和修复常见的 UTF-8 编码问题
 */

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
  
  // 直接的 UTF-8 特殊字符 - 转换为 ASCII 等价字符
  [/\u2019/g, "'"],               // ’ -> ' (右单引号)
  [/\u2018/g, "'"],               // ‘ -> ' (左单引号)
  [/\u201C/g, '"'],               // “ -> " (左双引号)
  [/\u201D/g, '"'],               // ” -> " (右双引号)
  [/\u2013/g, "-"],               // – -> - (短破折号)
  [/\u2014/g, "--"],              // — -> -- (长破折号)
  [/\u2026/g, "..."],             // … -> ... (省略号)
];

/**
 * 检测内容中是否存在编码问题
 * @param {string} content - 要检测的内容
 * @returns {Array} - 问题列表
 */
export function detectEncodingIssues(content) {
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

/**
 * 修复内容中的编码问题
 * @param {string} content - 要修复的内容
 * @returns {Object} - 包含修复后的内容和修复数量
 */
export function fixEncodingIssues(content) {
  let fixedContent = content;
  let changes = 0;
  
  for (const [pattern, replacement] of encodingFixes) {
    const matches = fixedContent.match(pattern);
    if (matches) {
      changes += matches.length;
      fixedContent = fixedContent.replace(pattern, replacement);
    }
  }
  
  return { content: fixedContent, changes };
}

/**
 * 自动处理内容编码 - 检测并修复
 * @param {string} content - 要处理的内容
 * @returns {Object} - 包含处理后的内容和处理信息
 */
export function autoFixEncoding(content) {
  const issues = detectEncodingIssues(content);
  
  if (issues.length === 0) {
    return {
      content,
      changed: false,
      changes: 0,
      issues: []
    };
  }
  
  const { content: fixedContent, changes } = fixEncodingIssues(content);
  
  return {
    content: fixedContent,
    changed: true,
    changes,
    issues
  };
}

export default {
  detectEncodingIssues,
  fixEncodingIssues,
  autoFixEncoding
};
