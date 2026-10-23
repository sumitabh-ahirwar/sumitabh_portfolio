import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

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
    plugins: [react(), siteUrlMeta(env.VITE_SITE_URL)],
    build: {
      target: 'es2020',
      chunkSizeWarningLimit: 700,
    },
  };
});
