export const blockedSlugs = [
    ".well-known",
    "api",
    "app",
    "assets",
    "auth",
    "blog",
    "manage",
    "favicon.ico",
    "manifest.json",
    "robots.txt",
    "sitemap.xml",
    "login",
    "file",
    "new",
];

export const validSlugRegex = /^[a-z0-9-_]+$/;
export const minLength = 3;
export const maxLength = 32;