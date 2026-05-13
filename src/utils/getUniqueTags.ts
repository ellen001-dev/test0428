import type { CollectionEntry } from "astro:content";
import { slugifyStr } from "./slugify";
import postFilter from "./postFilter";

interface Tag {
  tag: string;
  tagName: string;
}

const MIN_POSTS_PER_TAG = 5;

export const getTagCountMap = (posts: CollectionEntry<"blog">[]) => {
  const filteredPosts = posts.filter(postFilter);
  const tagCountMap = new Map<string, number>();
  
  filteredPosts.forEach(post => {
    post.data.tags.forEach(tag => {
      const slugifiedTag = slugifyStr(tag);
      tagCountMap.set(slugifiedTag, (tagCountMap.get(slugifiedTag) || 0) + 1);
    });
  });
  
  return tagCountMap;
};

export const isTagValid = (tagCountMap: Map<string, number>, tag: string) => {
  const slugifiedTag = slugifyStr(tag);
  return (tagCountMap.get(slugifiedTag) ?? 0) >= MIN_POSTS_PER_TAG;
};

const getUniqueTags = (posts: CollectionEntry<"blog">[]) => {
  const filteredPosts = posts.filter(postFilter);
  const tagCountMap = getTagCountMap(posts);
  
  const tags: Tag[] = [];
  const seenTags = new Set<string>();
  
  filteredPosts.forEach(post => {
    post.data.tags.forEach(tag => {
      const slugifiedTag = slugifyStr(tag);
      if (!seenTags.has(slugifiedTag) && isTagValid(tagCountMap, tag)) {
        seenTags.add(slugifiedTag);
        tags.push({ tag: slugifiedTag, tagName: tag });
      }
    });
  });
  
  return tags.sort((tagA, tagB) => tagA.tag.localeCompare(tagB.tag));
};

export default getUniqueTags;
