import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((context, next) => {
  const url = new URL(context.request.url);
  
  // Redirect old privacy policy URL to new one
  if (url.pathname === "/privacy%20policy/" || url.pathname === "/privacy policy/") {
    return context.redirect("/privacy-policy/", 301);
  }
  
  return next();
});
