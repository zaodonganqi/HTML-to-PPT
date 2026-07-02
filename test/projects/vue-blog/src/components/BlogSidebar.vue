<template>
  <aside class="sidebar-area">
    <!-- ── Author Card ── -->
    <div class="author-card">
      <div class="author-card-header">
        <img
          id="author-avatar"
          class="author-avatar"
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=144&h=144&fit=crop&crop=face"
          alt="Elena Vasquez"
        />
        <div class="author-name-wrap">
          <span id="author-name">Elena Vasquez</span>
          <span id="author-title">Senior Editor, Technology</span>
        </div>
      </div>
      <p id="author-bio">
        Elena covers the intersection of technology, design, and independent
        publishing. Her work has appeared in Wired, A List Apart, and The
        Atlantic. She is the author of <em>Small Web, Big Ideas</em>.
      </p>
      <div id="author-social-links" class="social-links">
        <span class="social-link-icon">T</span>
        <span class="social-link-icon">G</span>
        <span class="social-link-icon">L</span>
        <span class="social-link-icon">M</span>
      </div>
    </div>

    <!-- ── Popular Posts ── -->
    <div class="popular-posts">
      <h3 id="popular-posts-heading" class="popular-posts-heading">
        Trending on Polaris
      </h3>

      <div class="popular-post-item">
        <img
          id="popular-thumb-1"
          class="popular-post-thumb"
          src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=176&h=136&fit=crop"
          alt="Code on screen"
        />
        <div class="popular-post-info">
          <span id="popular-title-1" class="popular-post-title">
            Why Rust Is Eating the Backend, One Crate at a Time
          </span>
          <span id="popular-date-1" class="popular-post-date">Jun 25, 2026</span>
        </div>
      </div>

      <div class="popular-post-item">
        <img
          id="popular-thumb-2"
          class="popular-post-thumb"
          src="https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=176&h=136&fit=crop"
          alt="Design tools on desk"
        />
        <div class="popular-post-info">
          <span id="popular-title-2" class="popular-post-title">
            The Design Systems Handbook: Scaling Without Losing Your Soul
          </span>
          <span id="popular-date-2" class="popular-post-date">Jun 22, 2026</span>
        </div>
      </div>

      <div class="popular-post-item">
        <img
          id="popular-thumb-3"
          class="popular-post-thumb"
          src="https://images.unsplash.com/photo-1542744094-24638eff58f6?w=176&h=136&fit=crop"
          alt="Notebook and pen"
        />
        <div class="popular-post-info">
          <span id="popular-title-3" class="popular-post-title">
            Long-Form Blogging Is Back — and It Is Better Than Ever
          </span>
          <span id="popular-date-3" class="popular-post-date">Jun 18, 2026</span>
        </div>
      </div>

      <div class="popular-post-item">
        <img
          id="popular-thumb-4"
          class="popular-post-thumb"
          src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=176&h=136&fit=crop"
          alt="Person using laptop"
        />
        <div class="popular-post-info">
          <span id="popular-title-4" class="popular-post-title">
            From Burnout to Balance: A Creator's Guide to Sustainable Output
          </span>
          <span id="popular-date-4" class="popular-post-date">Jun 14, 2026</span>
        </div>
      </div>
    </div>

    <!-- ── Subscribe Mini Banner ── -->
    <div class="subscribe-mini">
      <h3 id="subscribe-mini-heading">Get the Digest</h3>
      <p id="subscribe-mini-text">
        The best of Polaris Review, delivered to your inbox every Sunday
        morning. Unsubscribe anytime.
      </p>
      <span id="subscribe-mini-btn" class="subscribe-mini-btn">
        Subscribe Free
      </span>
    </div>
  </aside>
</template>

<script setup>
// BlogSidebar — author card, popular posts, and subscription CTA
</script>
