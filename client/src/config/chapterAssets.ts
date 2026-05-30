/** Chapter 1 scroll pages (8 distinct assets in `public/read-pages/`). */
export const DEMO_CHAPTER_1_PAGE_URLS: string[] = Array.from(
  { length: 8 },
  (_, i) => `/read-pages/${i + 1}.png`,
)
