# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Avatar Previewer — a **pure frontend** single-page app that lets users upload an image, crop/rotate it, and preview how it looks as an avatar across 10 social platforms. No backend required — all image handling is client-side via Canvas and FileReader.

## Commands

```bash
python3 -m http.server -d frontend 8000
# Then open http://localhost:8000
```

No build step, no dependencies.

## Architecture

Five files in `frontend/`:

- **`index.html`** — Vue 3 (CDN) app shell with inline platform preview components (10 platforms). Upload areas, background image toggle, and cropper script/style includes.
- **`app.js`** — Vue 3 Composition API. Handles file selection via drag-drop or click, opens the cropper modal, applies cropped data URLs to reactive refs.
- **`cropper.js`** — Canvas-based image crop & rotate editor. Exposes `window.ImageCropper.open({ file, aspect, onConfirm, onCancel })`. Supports drag-to-crop with corner/edge handles, 90° rotation, rule-of-thirds grid. `aspect: 1` locks to square (avatar), `aspect: null` is free (background).
- **`cropper.css`** — Dark modal overlay styling for the cropper.
- **`style.css`** — Per-platform CSS for 10 platform mockups. Class prefixes: `wc-` (WeChat), `qzone-` (QQ), `wb-` (Weibo), `bili-` (Bilibili), `dy-` (Douyin), `xhs-` (Xiaohongshu), `gh-` (GitHub), `tw-` (Twitter), `dc-` (Discord), `tg-`/`tgme-` (Telegram).

## Data Flow

1. User selects image file → validation in `app.js`
2. `ImageCropper.open()` shows crop modal with canvas rendering
3. User adjusts crop area (drag/resize) and rotation
4. "确定裁剪" → canvas exports cropped image as data URL via `toDataURL()`
5. Data URL bound to Vue ref (`imageUrl` for avatar, `bgImageUrl` for background)
6. All `<img :src="imageUrl">` tags reactively update across 10 platform cards

## Key Conventions

- No build pipeline — edit files directly
- All image handling is client-side (Canvas + FileReader) — no upload API
- Vue 3 loaded from CDN (`unpkg.com/vue@3/dist/vue.global.prod.js`)
- Avatar crop forces 1:1 aspect ratio; background crop is free-form
- Background image applies to platform cover/banner areas (`wx-hero`, `qzone-cover-area`, `wb-profile-cover`, `tw-banner`, `dc-banner`)
- `v-cloak` directive prevents FOUC on page load
