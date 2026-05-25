import { BLOG_PATH } from "@/content.config";
import { slugifyStr } from "./slugify";
import { SITE } from "@/config";

/**
 * Get full path of a blog post
 * @param id - id of the blog post (aka slug)
 * @param filePath - the blog post full file location
 * @param includeBase - whether to include `/posts` in return value
 * @param category - the post category for routing
 * @param fullUrl - whether to return full URL with domain
 * @param customSlug - optional custom slug from frontmatter
 * @returns blog post path
 */
export function getPath(
  id: string,
  filePath: string | undefined,
  includeBase = true,
  category?: string,
  fullUrl = true,
  customSlug?: string
) {
  const pathSegments = filePath
    ?.replace(BLOG_PATH, "")
    .split("/")
    .filter(path => path !== "") // remove empty string in the segments ["", "other-path"] <- empty string will be removed
    .filter(path => !path.startsWith("_")) // exclude directories start with underscore "_"
    .slice(0, -1) // remove the last segment_ file name_ since it's unnecessary
    .map(segment => slugifyStr(segment)); // slugify each segment path

  // Use category as base path if provided, otherwise use /posts
  const basePath = includeBase 
    ? category 
      ? `/${category}` 
      : "/posts" 
    : "";

  // Use custom slug from frontmatter if provided, otherwise derive from id
  const slug = customSlug || (() => {
    const blogId = id.split("/");
    return blogId.length > 0 ? blogId.slice(-1)[0] : blogId[0];
  })();

  // If not inside the sub-dir, simply return the file path
  if (!pathSegments || pathSegments.length < 1) {
    const path = `${[basePath, slug].join("/")}/`;
    return fullUrl ? `${SITE.website.replace(/\/$/, "")}${path}` : path;
  }

  const path = `${[basePath, ...pathSegments, slug].join("/")}/`;
  return fullUrl ? `${SITE.website.replace(/\/$/, "")}${path}` : path;
}
