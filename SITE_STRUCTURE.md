# ServiceToolBase Reviews - 网站结构规范文档

---

## 目录

1. [网站层级结构](#1-网站层级结构)
2. [URL标准规范](#2-url标准规范)
3. [文章Frontmatter标准](#3-文章frontmatter标准)
4. [分类与标签的区别](#4-分类与标签的区别)
5. [核心特点总结](#5-核心特点总结)

---

## 1. 网站层级结构

| 层级 | 模块/页面 | URL路径 | 功能描述 | 特点说明 |
|------|-----------|---------|----------|----------|
| **一级导航** | 首页 | `/` | 网站主入口，展示精选内容 | 包含热门标签、最新文章列表 |
| | 深度评测 | `/reviews/` | 品牌深度评测文章列表 | category: reviews |
| | 竞品对比 | `/compare/` | 竞品对比文章列表 | category: compare |
| | 工种指南Hub | `/hvac-software/` | 工种专属软件指南 | category: hub |
| | 定价透明分析 | `/housecall-pro-pricing/` | 定价分析文章列表 | category: pricing |
| **文章详情** | 评测类文章 | `/reviews/{slug}` | 深度评测文章详情 | 根据category动态生成 |
| | 对比类文章 | `/compare/{slug}` | 竞品对比文章详情 | 根据category动态生成 |
| | 指南类文章 | `/hvac-software/{slug}` | 工种指南文章详情 | 根据category动态生成 |
| | 定价类文章 | `/housecall-pro-pricing/{slug}` | 定价分析文章详情 | 根据category动态生成 |
| **辅助页面** | 全部文章 | `/posts/` | 所有文章分页列表 | 包含draft过滤 |
| | 标签页面 | `/tags/{tag}` | 按标签筛选文章 | 自动收集文章标签 |
| | 归档页面 | `/archives/` | 按时间归档文章 | 时间线展示 |
| | 关于页面 | `/about/` | 网站介绍 | Markdown格式 |
| | 搜索页面 | `/search/` | 站内搜索 | Fuse.js模糊搜索 |

---

## 2. URL标准规范

| 类型 | URL模式 | 示例 | 说明 |
|------|---------|------|------|
| **分类列表** | `/{category}/` | `/reviews/` | 对应四个主分类 |
| **文章详情** | `/{category}/{slug}` | `/reviews/jobber-alternatives` | slug为文章文件名 |
| **标签页面** | `/tags/{tag}` | `/tags/项目管理` | tag为文章标签名 |
| **分页列表** | `/posts/page/{n}` | `/posts/page/2` | 文章列表分页 |
| **特殊页面** | `/{page}` | `/about`, `/archives` | 静态页面 |

---

## 3. 文章Frontmatter标准

```yaml
---
title: "文章标题"           # 必填，文章标题
pubDatetime: 2025-01-15T10:00:00Z  # 必填，发布时间
category: reviews          # 必填，四个分类之一
slug: custom-slug          # 可选，自定义URL路径
tags:                      # 可选，多个标签
  - 项目管理
  - CRM
  - 现场服务
featured: true             # 可选，是否精选
draft: false               # 可选，草稿状态
description: "文章描述"     # 必填，SEO描述
author: Admin              # 可选，作者名
---
```

### 3.1 Category 可选值

| 值 | 对应页面 | 说明 |
|----|----------|------|
| `reviews` | `/reviews/` | 品牌深度评测 |
| `compare` | `/compare/` | 竞品对比 |
| `hub` | `/hvac-software/` | 工种指南Hub |
| `pricing` | `/housecall-pro-pricing/` | 定价透明分析 |

---

## 4. 分类与标签的区别

| 维度 | Category（分类） | Tags（标签） |
|------|------------------|-------------|
| **数量限制** | 一篇文章仅一个 | 一篇文章可多个 |
| **层级关系** | 一级分类（必填） | 二级标签（可选） |
| **URL路径** | 作为URL前缀 | 独立标签页面 |
| **管理方式** | 固定四个选项 | 自由添加 |
| **用途** | 宏观内容组织 | 微观主题筛选 |

---

## 5. 核心特点总结

### 5.1 动态路由
- 文章URL根据category自动生成，无需手动配置
- 新增分类只需添加对应页面文件和路由配置

### 5.2 自动标签收集
- 系统自动扫描文章标签，生成标签页面
- 首页热门标签统计自动更新

### 5.3 分类唯一性
- 每篇文章归属唯一分类，确保内容结构清晰
- 避免内容重复展示

### 5.4 SEO友好
- URL包含分类信息，利于搜索引擎收录
- 文章描述自动生成meta标签

### 5.5 扩展性强
- 新增文章只需设置category，自动归类到对应页面
- 标签自由添加，无需预先配置

---

## 6. 文件结构

```
src/
├── pages/
│   ├── index.astro              # 首页
│   ├── reviews/
│   │   └── index.astro          # 深度评测列表
│   ├── compare/
│   │   └── index.astro          # 竞品对比列表
│   ├── hvac-software/
│   │   └── index.astro          # 工种指南列表
│   ├── housecall-pro-pricing/
│   │   └── index.astro          # 定价分析列表
│   ├── [category]/
│   │   └── [...slug]/
│   │       └── index.astro      # 文章详情动态路由
│   ├── posts/
│   │   └── [...page].astro      # 全部文章分页
│   ├── tags/
│   │   └── [...page].astro      # 标签页面
│   ├── archives/
│   │   └── index.astro          # 归档页面
│   ├── about.md                 # 关于页面
│   └── search/
│       └── index.astro          # 搜索页面
├── data/
│   └── blog/                    # 文章目录
│       ├── 1.md                 # 文章文件
│       └── seo-basics.md        # 文章文件
└── components/
    ├── Header.astro             # 导航头部
    ├── Card.astro               # 文章卡片
    └── ...
```

---

## 7. 新增文章流程

1. **创建文件**：在 `src/data/blog/` 目录下新建 `.md` 文件
2. **填写Frontmatter**：设置 `category` 和 `tags` 字段
3. **编写内容**：使用Markdown格式编写文章正文
4. **提交代码**：推送到GitHub，Vercel自动部署

---

*文档版本：v1.0*  
*最后更新：2026-04-30*