# URL 格式规范

## 规则

### 1. 所有内部链接必须以斜杠 `/` 结尾

**正确示例**:
```astro
<a href="/reviews/">Software Reviews</a>
<a href="/tags/jobber/">Jobber Tag</a>
<a href={`/tags/${slugifyStr(tag)}/`}>Dynamic Tag</a>
```

**错误示例**:
```astro
<a href="/reviews">Software Reviews</a>
<a href="/tags/jobber">Jobber Tag</a>
<a href={`/tags/${slugifyStr(tag)}`}>Dynamic Tag</a>
```

### 2. 使用 getPath 函数生成文章链接

文章链接应始终使用 `getPath` 函数，它会自动处理斜杠：

```astro
---
import { getPath } from "@/utils/getPath";
---
<a href={getPath(post.id, post.filePath, true, post.data.category)}>
  Read More
</a>
```

### 3. Tag 链接使用 Tag 组件

不要手动构建tag链接，使用现有的 Tag 组件：

```astro
---
import Tag from "@/components/Tag.astro";
---
<Tag tag={slugifyStr(tag)} tagName={tag} />
```

### 4. 静态链接检查清单

在添加新的静态链接时，检查：
- [ ] 链接以 `/` 开头
- [ ] 链接以 `/` 结尾
- [ ] 没有多余的空格

### 5. 常见路径参考

| 页面类型 | 正确格式 |
|---------|---------|
| 首页 | `/` |
| Reviews | `/reviews/` |
| Compare | `/compare/` |
| HVAC Software | `/hvac-software/` |
| Posts | `/posts/` |
| Tags 列表 | `/tags/` |
| 具体 Tag | `/tags/{tag-name}/` |
| Tag 分页 | `/tags/{tag-name}/2/` |
| Privacy Policy | `/privacy-policy/` |
| About | `/about/` |
| 文章 (reviews) | `/reviews/{slug}/` |
| 文章 (hub) | `/hub/{slug}/` |
| 文章 (compare) | `/compare/{slug}/` |
| 文章 (posts) | `/posts/{slug}/` |
