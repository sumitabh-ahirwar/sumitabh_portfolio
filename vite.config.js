import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { profile } from './src/data/profile.js';

// Guards against a renamed/missing resume: in dev an unknown path silently returns the
// HTML page, and in production it 404s. Warn while developing, fail the build.
function checkResume() {
  const file = path.join(process.cwd(), 'public', decodeURIComponent(profile.resume.href));
  return {
    name: 'check-resume',
    buildStart() {
      if (fs.existsSync(file)) return;
      const msg = `Resume not found: public${profile.resume.href} — update profile.resume.href in src/data/profile.js to match the file in public/resume/.`;
      if (this.meta.watchMode) this.warn(msg);
      else this.error(msg);
    },
  };
}

// Injects canonical + absolute social URLs only when VITE_SITE_URL is configured,
// so we never ship an invented domain.
function siteUrlMeta(siteUrl) {
  return {
    name: 'site-url-meta',
    transformIndexHtml(html) {
      if (!siteUrl) return html;
      const url = siteUrl.replace(/\/$/, '');
      return html
        .replace(/content="\/og-image\.png"/g, `content="${url}/og-image.png"`)
        .replace(
          '</head>',
          `    <link rel="canonical" href="${url}/" />\n    <meta property="og:url" content="${url}/" />\n  </head>`,
        );
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), siteUrlMeta(env.VITE_SITE_URL), checkResume()],
    build: {
      target: 'es2020',
      chunkSizeWarningLimit: 700,
    },
  };
});
