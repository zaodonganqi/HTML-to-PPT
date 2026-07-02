/**
 * ═══════════════════════════════════════════════════════════════
 * The Polaris Review — HTP Runtime Integration
 * ═══════════════════════════════════════════════════════════════
 *
 * FINE-GRAINED htp marking: every text element, image, table,
 * and decorative area gets its own explicit htp call with a
 * specific CSS selector.  No htp.auto() — no whole-page fallback.
 */

import { createApp, nextTick } from 'vue'
import { htp } from '@htp/runtime'
import App from './App.vue'
import './style.css'

// 配置 HTP runtime
htp.configure({
  deck: { width: 13.333, height: 7.5, layout: "LAYOUT_WIDE" },
  globals: { ready: "__HTP_READY__", manifest: "__HTP_MANIFEST__" },
});

const app = createApp(App)
app.mount('#app')

// ───────────────────────────────────────────────────────────
// 等 Vue 渲染完成后逐元素标记（双 rAF 确保 DOM 已提交）
// ───────────────────────────────────────────────────────────
nextTick(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      markAllElements()
      htp.ready()
    })
  })
})

function markAllElements() {
  // ════════════════════════════════════════════════════════
  // SLIDE 1 — Hero / Header
  // ════════════════════════════════════════════════════════
  htp.slide('.slide-hero', { id: 'slide-hero', order: 1 })

  // ── Nav bar ──
  htp.fallback('.site-logo', { id: 'site-logo' })
  htp.text('#nav-link-home', { id: 'nav-home' })
  htp.text('#nav-link-articles', { id: 'nav-articles' })
  htp.text('#nav-link-culture', { id: 'nav-culture' })
  htp.text('#nav-link-tech', { id: 'nav-tech' })
  htp.text('#nav-link-about', { id: 'nav-about' })
  htp.fallback('.search-icon', { id: 'search-icon' })

  // ── Hero content ──
  htp.text('#featured-title', { id: 'featured-title' })
  htp.text('#featured-excerpt', { id: 'featured-excerpt' })
  htp.text('#featured-author', { id: 'featured-author' })
  htp.text('#featured-date', { id: 'featured-date' })
  htp.image('#featured-image', { id: 'featured-image' })

  // ── Hero bottom bar ──
  htp.fallback('.hero-tags', { id: 'hero-tags' })
  htp.text('#hero-read-time', { id: 'hero-read-time' })

  // ════════════════════════════════════════════════════════
  // SLIDE 2 — Article + Sidebar
  // ════════════════════════════════════════════════════════
  htp.slide('.slide-content', { id: 'slide-content', order: 2 })

  // ── Article body ──
  htp.text('#article-title', { id: 'article-title' })
  htp.text('#article-subtitle', { id: 'article-subtitle' })

  htp.text('#article-heading-1', { id: 'article-heading-1' })
  htp.text('#article-p1', { id: 'article-p1' })
  htp.text('#article-p2', { id: 'article-p2' })

  htp.text('#article-heading-2', { id: 'article-heading-2' })
  htp.text('#article-p3', { id: 'article-p3' })

  htp.text('#article-blockquote-text', { id: 'article-blockquote-text' })

  htp.text('#article-heading-3', { id: 'article-heading-3' })
  htp.text('#article-p4', { id: 'article-p4' })

  htp.fallback('.inline-code-block', { id: 'inline-code-block' })

  htp.image('#article-inline-image', { id: 'article-inline-image' })
  htp.text('#article-image-caption', { id: 'article-image-caption' })

  // ── Author card (sidebar) ──
  htp.image('#author-avatar', { id: 'author-avatar' })
  htp.text('#author-name', { id: 'author-name' })
  htp.text('#author-title', { id: 'author-title' })
  htp.text('#author-bio', { id: 'author-bio' })
  htp.fallback('#author-social-links', { id: 'author-social-links' })

  // ── Popular posts (sidebar) ──
  htp.text('#popular-posts-heading', { id: 'popular-posts-heading' })

  htp.image('#popular-thumb-1', { id: 'popular-thumb-1' })
  htp.text('#popular-title-1', { id: 'popular-title-1' })
  htp.text('#popular-date-1', { id: 'popular-date-1' })

  htp.image('#popular-thumb-2', { id: 'popular-thumb-2' })
  htp.text('#popular-title-2', { id: 'popular-title-2' })
  htp.text('#popular-date-2', { id: 'popular-date-2' })

  htp.image('#popular-thumb-3', { id: 'popular-thumb-3' })
  htp.text('#popular-title-3', { id: 'popular-title-3' })
  htp.text('#popular-date-3', { id: 'popular-date-3' })

  htp.image('#popular-thumb-4', { id: 'popular-thumb-4' })
  htp.text('#popular-title-4', { id: 'popular-title-4' })
  htp.text('#popular-date-4', { id: 'popular-date-4' })

  // ── Subscribe mini banner (sidebar) ──
  htp.text('#subscribe-mini-heading', { id: 'subscribe-mini-heading' })
  htp.text('#subscribe-mini-text', { id: 'subscribe-mini-text' })
  htp.fallback('#subscribe-mini-btn', { id: 'subscribe-mini-btn' })

  // ════════════════════════════════════════════════════════
  // SLIDE 3 — Comments + Newsletter + Footer
  // ════════════════════════════════════════════════════════
  htp.slide('.slide-engagement', { id: 'slide-engagement', order: 3 })

  // ── Comments ──
  htp.text('#comments-heading', { id: 'comments-heading' })
  htp.table('#comment-table', { id: 'comment-table' })

  // ── Newsletter CTA ──
  htp.text('#newsletter-heading', { id: 'newsletter-heading' })
  htp.text('#newsletter-subheading', { id: 'newsletter-subheading' })
  htp.fallback('.newsletter-bg', { id: 'newsletter-bg' })
  htp.fallback('#newsletter-form', { id: 'newsletter-form' })

  // ── Footer ──
  htp.text('#footer-tagline', { id: 'footer-tagline' })

  // Footer column: Explore
  htp.text('#footer-explore-heading', { id: 'footer-explore-heading' })
  htp.text('#footer-link-home', { id: 'footer-link-home' })
  htp.text('#footer-link-features', { id: 'footer-link-features' })
  htp.text('#footer-link-newsletter', { id: 'footer-link-newsletter' })
  htp.text('#footer-link-pricing', { id: 'footer-link-pricing' })

  // Footer column: Company
  htp.text('#footer-company-heading', { id: 'footer-company-heading' })
  htp.text('#footer-link-about', { id: 'footer-link-about' })
  htp.text('#footer-link-careers', { id: 'footer-link-careers' })
  htp.text('#footer-link-press', { id: 'footer-link-press' })
  htp.text('#footer-link-contact', { id: 'footer-link-contact' })

  // Footer column: Connect
  htp.text('#footer-connect-heading', { id: 'footer-connect-heading' })
  htp.text('#footer-link-twitter', { id: 'footer-link-twitter' })
  htp.text('#footer-link-linkedin', { id: 'footer-link-linkedin' })
  htp.text('#footer-link-instagram', { id: 'footer-link-instagram' })
  htp.text('#footer-link-github', { id: 'footer-link-github' })

  htp.text('#copyright', { id: 'copyright' })
  htp.fallback('#footer-social-icons', { id: 'footer-social-icons' })
}
