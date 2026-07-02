/**
 * ═══════════════════════════════════════════════════════════════
 * Atlas Corp — Enterprise Intelligence Platform
 * HTP Runtime Integration (Fine-Grained Marking)
 * ═══════════════════════════════════════════════════════════════
 *
 * Every individual text, image, table, and decorative element is
 * marked with a SPECIFIC selector. No whole-page fallback is used.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { htp } from "@htp/runtime";
import App from "./App";

// ---------------------------------------------------------------------------
// Configure HTP runtime
// ---------------------------------------------------------------------------
htp.configure({
  deck: { width: 13.333, height: 7.5, layout: "LAYOUT_WIDE" },
  globals: { ready: "__HTP_READY__", manifest: "__HTP_MANIFEST__" },
});

// ---------------------------------------------------------------------------
// Render React app
// ---------------------------------------------------------------------------
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));

// ---------------------------------------------------------------------------
// Mark all elements with fine-grained htp selectors
// Uses requestAnimationFrame to ensure React DOM is fully committed.
// ---------------------------------------------------------------------------
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    // ── Slides ──────────────────────────────────────────────────────────
    htp.slide("#hero", { id: "slide-hero", order: 1 });
    htp.slide("#clients", { id: "slide-clients", order: 2 });
    htp.slide("#features", { id: "slide-features", order: 3 });
    htp.slide("#stats", { id: "slide-stats", order: 4 });
    htp.slide("#demo", { id: "slide-demo", order: 5 });
    htp.slide("#pricing", { id: "slide-pricing", order: 6 });
    htp.slide("#testimonials", { id: "slide-testimonials", order: 7 });
    htp.slide("#team", { id: "slide-team", order: 8 });
    htp.slide("#cta-banner", { id: "slide-cta", order: 9 });

    // ── Navbar ──────────────────────────────────────────────────────────
    htp.fallback("#navbar-logo", { id: "nav-logo" });
    htp.text("#navbar-brand", { id: "nav-brand" });
    htp.text("#nav-products", { id: "nav-products" });
    htp.text("#nav-solutions", { id: "nav-solutions" });
    htp.text("#nav-pricing", { id: "nav-pricing" });
    htp.text("#nav-company", { id: "nav-company" });
    htp.text("#nav-resources", { id: "nav-resources" });
    htp.text("#navbar-cta-btn", { id: "nav-cta-btn" });

    // ── Hero ────────────────────────────────────────────────────────────
    htp.text("#hero-title", { id: "hero-title" });
    htp.text("#hero-subtitle", { id: "hero-subtitle" });
    htp.text("#hero-description", { id: "hero-description" });
    htp.text("#hero-cta-primary", { id: "hero-cta-primary" });
    htp.text("#hero-cta-secondary", { id: "hero-cta-secondary" });
    htp.fallback("#hero-illustration", { id: "hero-illustration" });
    htp.fallback("#hero-glow-teal", { id: "hero-glow-teal" });
    htp.fallback("#hero-glow-blue", { id: "hero-glow-blue" });

    // ── Clients ─────────────────────────────────────────────────────────
    htp.text("#clients-label", { id: "clients-label" });
    for (let i = 0; i < 6; i++) {
      htp.image(`#client-logo-${i}`, { id: `client-logo-${i}` });
      htp.text(`#client-name-${i}`, { id: `client-name-${i}` });
    }

    // ── Features ────────────────────────────────────────────────────────
    htp.text("#features-eyebrow", { id: "features-eyebrow" });
    htp.text("#features-title", { id: "features-title" });
    htp.text("#features-subtitle", { id: "features-subtitle" });
    for (let i = 0; i < 6; i++) {
      htp.fallback(`#feature-card-icon-${i}`, { id: `feature-card-icon-${i}` });
      htp.text(`#feature-card-title-${i}`, { id: `feature-card-title-${i}` });
      htp.text(`#feature-card-desc-${i}`, { id: `feature-card-desc-${i}` });
    }

    // ── Statistics ──────────────────────────────────────────────────────
    for (let i = 0; i < 4; i++) {
      htp.text(`#stat-number-${i}`, { id: `stat-number-${i}` });
      htp.text(`#stat-label-${i}`, { id: `stat-label-${i}` });
    }
    for (let i = 0; i < 3; i++) {
      htp.fallback(`#stat-separator-${i}`, { id: `stat-separator-${i}` });
    }

    // ── Demo / Dashboard ────────────────────────────────────────────────
    htp.text("#demo-eyebrow", { id: "demo-eyebrow" });
    htp.text("#demo-title", { id: "demo-title" });
    htp.image("#demo-screenshot", { id: "demo-screenshot" });
    for (let i = 1; i <= 3; i++) {
      htp.text(`#demo-annotation-${i} .demo-annotation-label`, {
        id: `demo-annotation-${i}`,
      });
    }

    // ── Pricing Table ───────────────────────────────────────────────────
    htp.text("#pricing-eyebrow", { id: "pricing-eyebrow" });
    htp.text("#pricing-title", { id: "pricing-title" });
    htp.text("#pricing-subtitle", { id: "pricing-subtitle" });
    htp.table("#pricing-table", { id: "pricing-table" });
    // Mark individual pricing cell text
    const pricingCols = ["feature", "starter", "pro", "enterprise"];
    for (let row = 0; row < 8; row++) {
      for (const col of pricingCols) {
        htp.text(`#pricing-${col}-${row}`, { id: `pricing-${col}-${row}` });
      }
    }
    // Pricing CTA buttons
    htp.text("#pricing-btn-starter", { id: "pricing-btn-starter" });
    htp.text("#pricing-btn-pro", { id: "pricing-btn-pro" });
    htp.text("#pricing-btn-enterprise", { id: "pricing-btn-enterprise" });

    // ── Testimonials ────────────────────────────────────────────────────
    htp.text("#testimonials-title", { id: "testimonials-title" });
    for (let i = 0; i < 3; i++) {
      htp.text(`#testimonial-quote-${i}`, { id: `testimonial-quote-${i}` });
      htp.image(`#testimonial-avatar-${i}`, { id: `testimonial-avatar-${i}` });
      htp.text(`#testimonial-name-${i}`, { id: `testimonial-name-${i}` });
      htp.text(`#testimonial-role-${i}`, { id: `testimonial-role-${i}` });
    }

    // ── Team ────────────────────────────────────────────────────────────
    htp.text("#team-title", { id: "team-title" });
    htp.text("#team-subtitle", { id: "team-subtitle" });
    for (let i = 0; i < 4; i++) {
      htp.image(`#team-photo-${i}`, { id: `team-photo-${i}` });
      htp.text(`#team-name-${i}`, { id: `team-name-${i}` });
      htp.text(`#team-role-${i}`, { id: `team-role-${i}` });
      htp.text(`#team-bio-${i}`, { id: `team-bio-${i}` });
    }

    // ── CTA Banner ──────────────────────────────────────────────────────
    htp.fallback("#cta-glow-top", { id: "cta-glow-top" });
    htp.fallback("#cta-glow-bottom", { id: "cta-glow-bottom" });
    htp.text("#cta-headline", { id: "cta-headline" });
    htp.text("#cta-description", { id: "cta-description" });
    htp.text("#cta-button", { id: "cta-button" });

    // ── Footer ──────────────────────────────────────────────────────────
    htp.fallback("#footer-logo", { id: "footer-logo" });
    htp.text("#footer-description", { id: "footer-description" });
    // Footer column titles
    for (let col = 0; col < 4; col++) {
      htp.text(`#footer-col-title-${col}`, { id: `footer-col-title-${col}` });
    }
    // Footer links: 4 columns x 5 links each
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 5; row++) {
        htp.text(`#footer-link-${col}-${row}`, { id: `footer-link-${col}-${row}` });
      }
    }
    htp.text("#footer-copyright", { id: "footer-copyright" });

    // ── Ready ───────────────────────────────────────────────────────────
    htp.ready();
  });
});
