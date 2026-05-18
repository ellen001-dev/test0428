import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { generateOgImageForPost } from "@/utils/generateOgImages";

export async function getStaticPaths() {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.map(post => {
    const category = post.data.category || "posts";
    const slug = post.id.split("/").pop() || post.id;
    return {
      params: { category, slug },
      props: { post },
    };
  });
}

export const GET: APIRoute = async ({ props }) => {
  const { post } = props;
  
  const buffer = await generateOgImageForPost(post);
  return new Response(new Uint8Array(buffer), {
    headers: { "Content-Type": "image/png" },
  });
};
