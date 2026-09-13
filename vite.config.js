import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Writes the entry stylesheet straight into index.html instead of linking it.
// As a <link> it was the one render-blocking request left (Lighthouse: ~190ms),
// and because a pending stylesheet holds back every paint, it also held back
// the inline preloader, whose whole point is to be on screen in the first
// frame. It is ~10KB gzipped, so inlining costs less than the round trip.
// Only the entry CSS is affected: lazy chunks (admin, leaflet) keep loading
// their own stylesheets on demand.
function inlineEntryCss() {
  return {
    name: 'inline-entry-css',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, { bundle }) {
        if (!bundle) return html
        return html.replace(
          /<link rel="stylesheet"(?: crossorigin)? href="\/([^"]+\.css)">/g,
          (tag, fileName) => {
            const asset = bundle[fileName]
            if (!asset || asset.type !== 'asset') return tag
            const css =
              typeof asset.source === 'string' ? asset.source : new TextDecoder().decode(asset.source)
            if (css.includes('</style')) return tag
            delete bundle[fileName]
            return `<style>${css}</style>`
          }
        )
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), inlineEntryCss()],
})
