<template>
  <div class="slides-container">
    <!-- ═══════════════ SLIDE 1: Hero + Header ═══════════════ -->
    <section class="slide slide-hero">
      <BlogHeader />
      <div class="hero-area">
        <div class="hero-content">
          <span class="hero-eyebrow">Featured Article</span>
          <h1 id="featured-title">
            The Quiet Revolution:<br />How Indie Creators Are<br />Redefining the Web
          </h1>
          <p id="featured-excerpt">
            A deep exploration into the resurgence of personal websites,
            handcrafted tools, and the people building a more humane
            internet — one blog post at a time.
          </p>
          <div class="hero-meta">
            <span id="featured-author">Elena Vasquez</span>
            <span class="hero-meta-divider"></span>
            <span id="featured-date">June 28, 2026</span>
          </div>
        </div>
        <div class="hero-image-wrap">
          <img
            id="featured-image"
            class="featured-image"
            src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=1080&fit=crop"
            alt="Person typing on laptop in cozy workspace with plants"
          />
        </div>
      </div>
      <div class="hero-bottom-bar">
        <div class="hero-tags">
          <span class="hero-tag">Technology</span>
          <span class="hero-tag">Indie Web</span>
          <span class="hero-tag">Creators</span>
        </div>
        <span id="hero-read-time" class="hero-read-time">12 min read</span>
      </div>
    </section>

    <!-- ═══════════════ SLIDE 2: Article + Sidebar ═══════════════ -->
    <section class="slide slide-content">
      <ArticleContent />
      <BlogSidebar />
    </section>

    <!-- ═══════════════ SLIDE 3: Comments + Newsletter + Footer ═══════════════ -->
    <section class="slide slide-engagement">
      <!-- Comments -->
      <div class="comments-section">
        <h2 id="comments-heading" class="comments-heading">
          Community Discussion &middot; 4 Comments
        </h2>
        <table id="comment-table" class="comment-table">
          <thead>
            <tr>
              <th>Reader</th>
              <th>Name</th>
              <th>Comment</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <img
                  class="comment-avatar"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=face"
                  alt="Marcus Chen"
                />
              </td>
              <td><span class="comment-name">Marcus Chen</span></td>
              <td class="comment-text">
                This resonates deeply. I launched my personal site last year and the
                creative freedom is unmatched. The tools have finally caught up to
                the ambition.
              </td>
              <td class="comment-date">Jun 29, 2026</td>
            </tr>
            <tr>
              <td>
                <img
                  class="comment-avatar"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=face"
                  alt="Sarah Mitchell"
                />
              </td>
              <td><span class="comment-name">Sarah Mitchell</span></td>
              <td class="comment-text">
                The "humane internet" framing is exactly right. We need more
                writing like this that challenges the platform-first mindset.
              </td>
              <td class="comment-date">Jun 30, 2026</td>
            </tr>
            <tr>
              <td>
                <img
                  class="comment-avatar"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face"
                  alt="James Okonkwo"
                />
              </td>
              <td><span class="comment-name">James Okonkwo</span></td>
              <td class="comment-text">
                One thing I'd add: the indie web isn't just about blogs — it's
                about owning your data, your audience, and your revenue. Great piece.
              </td>
              <td class="comment-date">Jul 1, 2026</td>
            </tr>
            <tr>
              <td>
                <img
                  class="comment-avatar"
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=face"
                  alt="Priya Nair"
                />
              </td>
              <td><span class="comment-name">Priya Nair</span></td>
              <td class="comment-text">
                I'd love to see a follow-up on how indie creators are monetizing
                sustainably. The subscription + newsletter model seems promising.
              </td>
              <td class="comment-date">Jul 2, 2026</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Newsletter CTA -->
      <div class="newsletter-section">
        <div class="newsletter-bg">
          <div class="newsletter-text">
            <h2 id="newsletter-heading">
              Never miss a story.
            </h2>
            <p id="newsletter-subheading">
              Weekly deep-dives on design, technology, and the future of the web.
            </p>
          </div>
          <div id="newsletter-form" class="newsletter-form">
            <input
              class="newsletter-input"
              type="email"
              placeholder="your@email.com"
            />
            <button class="newsletter-submit" type="button">
              Subscribe Free
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <BlogFooter />
    </section>
  </div>
</template>

<script setup>
import BlogHeader from './components/BlogHeader.vue'
import ArticleContent from './components/ArticleContent.vue'
import BlogSidebar from './components/BlogSidebar.vue'
import BlogFooter from './components/BlogFooter.vue'
</script>
