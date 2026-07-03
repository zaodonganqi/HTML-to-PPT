/**
 * ═══════════════════════════════════════════════════════════════
 * Atlas Corp — Enterprise Intelligence Platform
 * HTP Runtime Integration (Fine-Grained Marking)
 * ═══════════════════════════════════════════════════════════════
 *
 * Every individual text, image, table, and decorative element is
 * marked with a SPECIFIC selector. Only explicit element markers are used.
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
    htp.slide("#hero");
    htp.slide("#clients");
    htp.slide("#features");
    htp.slide("#stats");
    htp.slide("#demo");
    htp.slide("#pricing");
    htp.slide("#testimonials");
    htp.slide("#team");
    htp.slide("#cta-banner");

    // ── Navbar ──────────────────────────────────────────────────────────
    htp.image("#navbar-logo");
    htp.text("#navbar-brand");
    htp.text("#nav-products");
    htp.text("#nav-solutions");
    htp.text("#nav-pricing");
    htp.text("#nav-company");
    htp.text("#nav-resources");
    htp.text("#navbar-cta-btn");

    // ── Hero ────────────────────────────────────────────────────────────
    htp.text("#hero-title");
    htp.text("#hero-subtitle");
    htp.text("#hero-description");
    htp.text("#hero-cta-primary");
    htp.text("#hero-cta-secondary");
    htp.image("#hero-illustration");
    htp.image("#hero-glow-teal");
    htp.image("#hero-glow-blue");

    // ── Clients ─────────────────────────────────────────────────────────
    htp.text("#clients-label");
    for (let i = 0; i < 6; i++) {
      htp.image(`#client-logo-${i}`);
      htp.text(`#client-name-${i}`);
    }

    // ── Features ────────────────────────────────────────────────────────
    htp.text("#features-eyebrow");
    htp.text("#features-title");
    htp.text("#features-subtitle");
    for (let i = 0; i < 6; i++) {
      htp.image(`#feature-card-icon-${i}`);
      htp.text(`#feature-card-title-${i}`);
      htp.text(`#feature-card-desc-${i}`);
    }

    // ── Statistics ──────────────────────────────────────────────────────
    for (let i = 0; i < 4; i++) {
      htp.text(`#stat-number-${i}`);
      htp.text(`#stat-label-${i}`);
    }
    for (let i = 0; i < 3; i++) {
      htp.image(`#stat-separator-${i}`);
    }

    // ── Demo / Dashboard ────────────────────────────────────────────────
    htp.text("#demo-eyebrow");
    htp.text("#demo-title");
    htp.image("#demo-screenshot");
    for (let i = 1; i <= 3; i++) {
      htp.text(`#demo-annotation-${i} .demo-annotation-label`);
    }

    // ── Pricing Table ───────────────────────────────────────────────────
    htp.text("#pricing-eyebrow");
    htp.text("#pricing-title");
    htp.text("#pricing-subtitle");
    htp.table("#pricing-table");
    // Mark individual pricing cell text
    const pricingCols = ["feature", "starter", "pro", "enterprise"];
    for (let row = 0; row < 8; row++) {
      for (const col of pricingCols) {
        htp.text(`#pricing-${col}-${row}`);
      }
    }
    // Pricing CTA buttons
    htp.text("#pricing-btn-starter");
    htp.text("#pricing-btn-pro");
    htp.text("#pricing-btn-enterprise");

    // ── Testimonials ────────────────────────────────────────────────────
    htp.text("#testimonials-title");
    for (let i = 0; i < 3; i++) {
      htp.text(`#testimonial-quote-${i}`);
      htp.image(`#testimonial-avatar-${i}`);
      htp.text(`#testimonial-name-${i}`);
      htp.text(`#testimonial-role-${i}`);
    }

    // ── Team ────────────────────────────────────────────────────────────
    htp.text("#team-title");
    htp.text("#team-subtitle");
    for (let i = 0; i < 4; i++) {
      htp.image(`#team-photo-${i}`);
      htp.text(`#team-name-${i}`);
      htp.text(`#team-role-${i}`);
      htp.text(`#team-bio-${i}`);
    }

    // ── CTA Banner ──────────────────────────────────────────────────────
    htp.image("#cta-glow-top");
    htp.image("#cta-glow-bottom");
    htp.text("#cta-headline");
    htp.text("#cta-description");
    htp.text("#cta-button");

    // ── Footer ──────────────────────────────────────────────────────────
    htp.image("#footer-logo");
    htp.text("#footer-description");
    // Footer column titles
    for (let col = 0; col < 4; col++) {
      htp.text(`#footer-col-title-${col}`);
    }
    // Footer links: 4 columns x 5 links each
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 5; row++) {
        htp.text(`#footer-link-${col}-${row}`);
      }
    }
    htp.text("#footer-copyright");

    // ── Ready ───────────────────────────────────────────────────────────
    htp.ready();
  });
});
