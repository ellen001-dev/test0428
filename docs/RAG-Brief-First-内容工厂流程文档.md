# RAG Brief-First 内容工厂完整流程文档

> **版本：v2.1** | **更新日期：2026-05-04**

---

## 一、整体架构

```
输入层 → 检索层 → 页面分析层 → 洞察层 → Brief生成层 → 人工审核层 → 写作层（后续可选）
```

**核心理念：**
- ✅ 先做 Brief，不直接批量生成文章
- ✅ **第一版：LLM 只生成 Brief**
- ✅ **后续可选：基于审核通过的 Brief 生成初稿**
- ✅ 信息型/商业型文章分流

---

## 二、完整流程工具清单（v2.1）

| 步骤 | 阶段 | 做什么 | 推荐工具 | 是否免费 | 替代工具 | 工具说明 |
|------|------|--------|----------|----------|----------|----------|
| **1** | 输入层 | 输入关键词池 | 手动输入 | ✅ 免费 | Ahrefs/Semrush | 标记文章类型：信息型/商业型 |
| **2** | 检索层 | SEO检索（Google前5-10） | **DataForSEO** | ❌ 付费 | SerpAPI | 获取真实Google排名、标题、URL、snippet |
| **3** | 检索层 | GEO-AI Overview | **DataForSEO/SerpAPI** | ❌ 付费 | - | 获取AI摘要答案结构、引用域名 |
| **4** | 检索层 | GEO-AI Mode | **SerpAPI** | ❌ 付费 | DataForSEO | 获取AI对话模式结果 |
| **5** | 页面分析层 | 页面抓取 | **Playwright** | ✅ 免费 | Puppeteer | 抓取前排页面HTML |
| **6** | 页面分析层 | 正文抽取与去噪 | **@mozilla/readability + jsdom** | ✅ 免费 | trafilatura | 去除导航/广告/页脚，提取正文 |
| **7** | 页面分析层 | 块级结构提取 | **Cheerio** | ✅ 免费 | node-html-parser | 提取H1/H2/H3、表格、FAQ、案例 |
| **8** | 页面分析层 | 格式转换 | **turndown** | ✅ 免费 | html-to-text | HTML转Markdown |
| **9** | 页面分析层 | 内容标准化 | **自定义脚本** | ✅ 免费 | - | canonical URL、语言检测、发布日期标准化 |
| **10** | 洞察层 | SEO洞察分析 | **SiliconFlow 或 OpenAI** | ❌ 付费 | 开源模型 | 分析共性、缺口、意图判断 |
| **11** | 洞察层 | GEO洞察分析 | **SiliconFlow 或 OpenAI** | ❌ 付费 | 开源模型 | AI引用偏好、结构分析 |
| **12** | Brief生成层 | Brief生成 | **SiliconFlow 或 OpenAI** | ❌ 付费 | 开源模型 | 输出结构化写作指南 |
| **13** | 人工审核层 | 人工审核 | **人工确认** | ✅ 免费 | - | 确认Brief后进入写作 |
| **14** | 写作层（后续可选） | 文章生成 | **SiliconFlow 或 OpenAI** | ❌ 付费 | 开源模型 | 根据Brief生成初稿（第一版不做） |

---

## 三、API选择说明

### SEO主检索源（必须付费）

| 工具 | 价格 | 认证方式 | 说明 |
|------|------|----------|------|
| **DataForSEO** | 付费（按次计费） | Basic Auth (login + password) | 专业SEO数据API，数据全面稳定 |
| **SerpAPI** | **$25/月起（Starter）** | API Key | 第三方SERP API，支持SEO+GEO |

> 📝 **DataForSEO 认证方式**：
> 使用 Basic Auth，需要 `DATAFORSEO_LOGIN` + `DATAFORSEO_PASSWORD`，不是单个 API key

> 📝 **SerpAPI 官方定价**（来源：SerpApi Pricing）：
> - Free: 250 searches/月
> - Starter: $25/月，1000 searches
> - Developer: $75/月，5000 searches

### GEO处理策略（二选一）

| 策略 | 适用场景 | 说明 |
|------|----------|------|
| **完整GEO（预算充足）** | 需要真正的AI搜索优化 | 纳入 AI Overview + AI Mode 数据 |
| **降级版（预算有限）** | 先做SEO，暂不做GEO | 改为"AI-friendly 内容结构建议"，不宣称做真正GEO分析 |

### LLM选择（明确二选一）

| 方案 | 环境变量 | SDK | 说明 |
|------|----------|-----|------|
| **OpenAI API** | `OPENAI_API_KEY` | openai SDK | 使用ChatGPT模型 |
| **SiliconFlow** | `SILICONFLOW_API_KEY` + `baseURL` | openai SDK | OpenAI兼容，国内速度快 |

> 📝 **SiliconFlow 配置方式**（使用 openai SDK）：
> ```javascript
> const client = new OpenAI({
>   apiKey: process.env.SILICONFLOW_API_KEY,
>   baseURL: "https://api.siliconflow.cn/v1"  // 注意：是 api.siliconflow.cn 不是 siliconflow.cn
> });
> ```

---

## 四、各阶段详细说明

### 1. 输入层
- **输入内容**：一批关键词，每个标记类型（信息型/商业型）
- **输出**：任务队列

### 2. 检索层

**SEO数据抓取：**
- Google organic前5-10结果
- 获取：标题、URL、snippet、SERP特征
- **使用工具**：DataForSEO 或 SerpAPI

**GEO数据抓取：**

| 数据类型 | 获取方式 | 工具 |
|----------|----------|------|
| AI Overview 结果 | 独立API调用或二次请求 | DataForSEO / SerpAPI |
| AI Mode 结果 | 独立API调用 | SerpAPI |
| 引用源标准化 | 提取域名、URL | 自定义处理 |
| 回答块结构分析 | 解析AI回答结构 | 自定义处理 |

### 3. 页面分析层（新增去噪模块）

**标准流程：**
```
Playwright抓取 → 正文抽取(readability+jsdom) → 块级结构提取 → 内容标准化
```

| 处理步骤 | 工具 | 说明 |
|----------|------|------|
| 页面抓取 | Playwright | 获取完整HTML |
| 正文抽取 | @mozilla/readability + jsdom | 去除导航/广告/页脚/评论区 |
| 块级结构提取 | Cheerio | 提取H1/H2/H3、表格、FAQ、案例 |
| 内容标准化 | 自定义脚本 | canonical URL、语言检测、发布日期标准化 |

> ⚠️ **为什么需要正文抽取？**
> - 真实网页包含大量模板噪音：导航、推荐位、页脚、广告、评论区、站内卡片
> - 这些噪音会污染后续的"共性分析"结果
> - 必须用 readability + jsdom 或 trafilatura 进行正文净化

### 4. 洞察层（核心）

**SEO洞察：**
- 搜索意图判断
- 前排内容共性
- 前排内容缺口
- 不该写什么
- 必须覆盖什么

**GEO洞察（如果纳入）：**
- AI回答偏好（定义/步骤/清单/对比）
- 引用页面共同结构
- 信息块总结规律
- 引用源类型（权威站/测评站/品牌站）

### 5. Brief生成层

**Brief模板结构：**
```
├── 推荐文章类型
├── 推荐标题角度
├── 核心读者意图
├── 必须覆盖的一级章节
├── 每章要回答的问题
├── 建议加入的表格/FAQ/案例
├── 竞品未覆盖但值得补的点
├── AI-friendly 摘要块（面向GEO）
├── 证据/数据需求清单
├── 证据来源URL列表（必须）
└── 风险提醒（YMYL、时间敏感、价格敏感）
```

> ✅ **新增：证据来源URL列表**
> - 每个数据点必须附带来源URL
> - 确保内容可溯源，避免虚假信息

### 6. 人工审核层
- 确认Brief质量
- 检查证据来源是否完整
- 决定是否进入写作

### 7. 写作层（后续可选，第一版不做）
- 基于审核通过的Brief生成完整文章
- 可选择性进行AI审核评分

---

## 五、两版实施策略

### 第一版（MVP）- 推荐先做这个

**目标：** 快速验证流程，稳定输出Brief

| 步骤 | 内容 | 工具 |
|------|------|------|
| 检索层 | SEO检索 | DataForSEO 或 SerpAPI |
| 页面分析 | 正文抽取 + 结构提取 | readability + jsdom + Cheerio |
| 洞察层 | SEO洞察分析 | SiliconFlow 或 OpenAI |
| Brief生成 | 标准Brief | SiliconFlow 或 OpenAI |
| 审核层 | 人工确认 | 人工 |

> **GEO处理策略：**
> - 如果预算充足：纳入AI Overview + AI Mode
> - 如果预算有限：降级为"AI-friendly 内容结构建议"，不宣称做真正GEO分析

> **写作层策略：**
> - 第一版：只生成Brief，不生成文章
> - 后续可选：基于审核通过的Brief生成初稿

### 完整版 - 后续迭代

在第一版稳定后，再考虑：
- 完整的GEO分析（AI Overview + AI Mode）
- 基于Brief的文章生成
- 自动发布流程
- 外链分析

---

## 六、成功标准（v2.1）

一份优质Brief应满足：

1. ✅ 准确判断关键词意图
2. ✅ 覆盖头部结果的共同核心主题
3. ✅ 找出2-5个可补缺口
4. ✅ 给出清晰可写的大纲
5. ✅ 明确AI-friendly的信息块组织方式
6. ✅ **Brief必须附带证据来源URL列表（新增）**

---

## 七、工具安装命令

```bash
# 安装核心依赖
npm install playwright @mozilla/readability jsdom cheerio turndown openai

# 安装浏览器（Playwright必须）
npx playwright install chromium

# 或安装所有浏览器
npx playwright install
```

> ⚠️ **重要**：
> 1. `npx playwright install` 必须执行，否则第一次运行会失败
> 2. Node 端使用 @mozilla/readability **必须配合 jsdom**，否则会报错

---

## 八、环境变量配置

### 方案A：OpenAI API

```bash
# .env
OPENAI_API_KEY="your-openai-api-key"
```

### 方案B：SiliconFlow（推荐国内用户）

```bash
# .env
SILICONFLOW_API_KEY="your-siliconflow-api-key"
# 注意：使用 openai SDK，baseURL 已内置
```

> 📝 **SiliconFlow 官方接口地址**：
> - 正确：`https://api.siliconflow.cn/v1`
> - 错误：`https://api.siliconflow.cn`（少了 /v1）

### SEO/GEO数据源

```bash
# .env - DataForSEO（使用 Basic Auth）
DATAFORSEO_LOGIN="your-dataforseo-login"
DATAFORSEO_PASSWORD="your-dataforseo-password"

# .env - SerpAPI（使用 API Key）
SERPAPI_API_KEY="your-serpapi-key"
```

---

**适用场景：** ServiceToolBase 内容工厂

---

*本文档基于专家建议和现有技术栈整理 v2.1，可根据实际需求调整。*