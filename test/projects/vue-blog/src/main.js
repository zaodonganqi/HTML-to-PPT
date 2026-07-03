/**
 * ═══════════════════════════════════════════════════════════════
 * The Polaris Review — HTP Runtime Integration
 * ═══════════════════════════════════════════════════════════════
 *
 * FINE-GRAINED htp marking: every text element, image, table,
 * and decorative area gets its own explicit htp call with a
 * specific CSS selector.  No htp.auto() — only explicit element markers.
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
  htp.slide('.slide-hero')

  // ── Nav bar ──
  htp.image('.site-logo')
  htp.text('#nav-link-home')
  htp.text('#nav-link-articles')
  htp.text('#nav-link-culture')
  htp.text('#nav-link-tech')
  htp.text('#nav-link-about')
  htp.image('.search-icon')

  // ── Hero content ──
  htp.text('#featured-title')
  htp.text('#featured-excerpt')
  htp.text('#featured-author')
  htp.text('#featured-date')
  htp.image('#featured-image')

  // ── Hero bottom bar ──
  htp.image('.hero-tags')
  htp.text('#hero-read-time')

  // ════════════════════════════════════════════════════════
  // SLIDE 2 — Article + Sidebar
  // ════════════════════════════════════════════════════════
  htp.slide('.slide-content')

  // ── Article body ──
  htp.text('#article-title')
  htp.text('#article-subtitle')

  htp.text('#article-heading-1')
  htp.text('#article-p1')
  htp.text('#article-p2')

  htp.text('#article-heading-2')
  htp.text('#article-p3')

  htp.text('#article-blockquote-text')

  htp.text('#article-heading-3')
  htp.text('#article-p4')

  htp.image('.inline-code-block')

  htp.image('#article-inline-image')
  htp.text('#article-image-caption')

  // ── Author card (sidebar) ──
  htp.image('#author-avatar')
  htp.text('#author-name')
  htp.text('#author-title')
  htp.text('#author-bio')
  htp.image('#author-social-links')

  // ── Popular posts (sidebar) ──
  htp.text('#popular-posts-heading')

  htp.image('#popular-thumb-1')
  htp.text('#popular-title-1')
  htp.text('#popular-date-1')

  htp.image('#popular-thumb-2')
  htp.text('#popular-title-2')
  htp.text('#popular-date-2')

  htp.image('#popular-thumb-3')
  htp.text('#popular-title-3')
  htp.text('#popular-date-3')

  htp.image('#popular-thumb-4')
  htp.text('#popular-title-4')
  htp.text('#popular-date-4')

  // ── Subscribe mini banner (sidebar) ──
  htp.text('#subscribe-mini-heading')
  htp.text('#subscribe-mini-text')
  htp.image('#subscribe-mini-btn')

  // ════════════════════════════════════════════════════════
  // SLIDE 3 — Comments + Newsletter + Footer
  // ════════════════════════════════════════════════════════
  htp.slide('.slide-engagement')

  // ── Comments ──
  htp.text('#comments-heading')
  htp.table('#comment-table')

  // ── Newsletter CTA ──
  htp.text('#newsletter-heading')
  htp.text('#newsletter-subheading')
  htp.image('.newsletter-bg')
  htp.image('#newsletter-form')

  // ── Footer ──
  htp.text('#footer-tagline')

  // Footer column: Explore
  htp.text('#footer-explore-heading')
  htp.text('#footer-link-home')
  htp.text('#footer-link-features')
  htp.text('#footer-link-newsletter')
  htp.text('#footer-link-pricing')

  // Footer column: Company
  htp.text('#footer-company-heading')
  htp.text('#footer-link-about')
  htp.text('#footer-link-careers')
  htp.text('#footer-link-press')
  htp.text('#footer-link-contact')

  // Footer column: Connect
  htp.text('#footer-connect-heading')
  htp.text('#footer-link-twitter')
  htp.text('#footer-link-linkedin')
  htp.text('#footer-link-instagram')
  htp.text('#footer-link-github')

  htp.text('#copyright')
  htp.image('#footer-social-icons')
}
