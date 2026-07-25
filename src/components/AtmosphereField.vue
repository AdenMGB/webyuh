<script setup lang="ts">
/**
 * Vivid-inspired atmospheric plane: soft luminous halos, chromatic fringe,
 * film grain, and scroll/pointer-driven drift. Sits behind content, over prism.
 */
</script>

<template>
  <div class="atmosphere" aria-hidden="true">
    <div class="atmosphere__veil" />
    <div class="atmosphere__halo atmosphere__halo--core" />
    <div class="atmosphere__halo atmosphere__halo--warm" />
    <div class="atmosphere__halo atmosphere__halo--cool" />
    <div class="atmosphere__fringe atmosphere__fringe--red" />
    <div class="atmosphere__fringe atmosphere__fringe--cyan" />
    <div class="atmosphere__grain" />
  </div>
</template>

<style scoped>
.atmosphere {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  isolation: isolate;
}

.atmosphere__veil {
  position: absolute;
  inset: -10%;
  background:
    radial-gradient(ellipse 80% 60% at 50% 45%, rgb(255 253 249 / 0.045), transparent 62%),
    radial-gradient(ellipse 70% 50% at 60% 40%, rgb(111 135 156 / 0.08), transparent 70%);
  transform: translate3d(
      calc(var(--motion-x, 0) * -2.5%),
      calc(var(--motion-y, 0) * -2% + var(--motion-scroll-y, 0vh)),
      0
    )
    scale(1.08);
  opacity: calc(0.9 - var(--motion-scroll, 0) * 0.2);
  will-change: transform, opacity;
}

.atmosphere__halo {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  mix-blend-mode: screen;
  will-change: transform, opacity;
}

.atmosphere__halo--core {
  width: min(72vw, 760px);
  height: min(72vw, 760px);
  top: 18%;
  left: 42%;
  background: radial-gradient(
    circle,
    rgb(255 253 249 / 0.16) 0%,
    rgb(111 135 156 / 0.08) 42%,
    transparent 70%
  );
  transform: translate3d(
    calc(var(--motion-x, 0) * 28px),
    calc(var(--motion-y, 0) * 22px + var(--motion-scroll, 0) * -70px),
    0
  );
  opacity: calc(0.9 - var(--motion-scroll, 0) * 0.35);
}

.atmosphere__halo--warm {
  width: min(48vw, 480px);
  height: min(48vw, 480px);
  top: 28%;
  left: 58%;
  background: radial-gradient(circle, rgb(255 42 42 / 0.14) 0%, transparent 68%);
  filter: blur(72px);
  transform: translate3d(
    calc(var(--motion-x, 0) * 40px - 8%),
    calc(var(--motion-y, 0) * 30px + var(--motion-scroll, 0) * -40px),
    0
  );
}

.atmosphere__halo--cool {
  width: min(54vw, 520px);
  height: min(54vw, 520px);
  top: 34%;
  left: 30%;
  background: radial-gradient(circle, rgb(42 127 255 / 0.14) 0%, transparent 70%);
  filter: blur(78px);
  transform: translate3d(
    calc(var(--motion-x, 0) * -36px + 6%),
    calc(var(--motion-y, 0) * 26px + var(--motion-scroll, 0) * -55px),
    0
  );
}

.atmosphere__fringe {
  position: absolute;
  width: min(40vw, 380px);
  height: min(40vw, 380px);
  border-radius: 50%;
  filter: blur(40px);
  mix-blend-mode: screen;
  opacity: calc(0.45 - var(--motion-scroll, 0) * 0.2);
  will-change: transform;
}

.atmosphere__fringe--red {
  top: 22%;
  left: 56%;
  background: rgb(255 42 42 / 0.18);
  transform: translate3d(
    calc(var(--motion-x, 0) * 54px),
    calc(var(--motion-y, 0) * 18px + var(--motion-scroll, 0) * -48px),
    0
  );
}

.atmosphere__fringe--cyan {
  top: 30%;
  left: 48%;
  background: rgb(42 127 255 / 0.16);
  transform: translate3d(
    calc(var(--motion-x, 0) * -48px),
    calc(var(--motion-y, 0) * 28px + var(--motion-scroll, 0) * -36px),
    0
  );
}

.atmosphere__grain {
  position: absolute;
  inset: 0;
  opacity: 0.14;
  mix-blend-mode: soft-light;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 180px 180px;
  animation: grain-shift 0.9s steps(2) infinite;
}

@keyframes grain-shift {
  0% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(-1.5%, 1%, 0);
  }
  100% {
    transform: translate3d(1%, -1%, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .atmosphere__grain {
    animation: none;
  }

  .atmosphere__veil,
  .atmosphere__halo,
  .atmosphere__fringe {
    transform: none !important;
    filter: blur(40px);
  }
}

@media (max-width: 720px) {
  .atmosphere__halo--core {
    left: 28%;
  }

  .atmosphere__grain {
    opacity: 0.1;
  }
}
</style>
