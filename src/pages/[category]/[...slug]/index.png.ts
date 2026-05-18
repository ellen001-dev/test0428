import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { generateOgImageForPost } from "@/utils/generateOgImages";

export const GET: APIRoute = async ({ params }) => {
  const { category, slug } = params;
  
  if (!category || !slug) {
    return new Response("Not found", { status: 404 });
  }

  const posts = await getCollection("blog", ({ data }) => !data.draft);
  const post = posts.find(p => {
    const postSlug = p.id.split("/").pop() || p.id;
    const postCategory = p.data.category || "posts";
    return postSlug === slug && postCategory === category;
  });

  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  const buffer = await generateOgImageForPost(post);
  return new Response(new Uint8Array(buffer), {
    headers: { "Content-Type": "image/png" },
  });
};
