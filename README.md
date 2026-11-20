# QuickQR — Free Online QR Code Generator

**Live Website:** https://deft-chebakia-15a213.netlify.app/

QuickQR is a fast, free, and 100% client-side QR code generator, scanner, and poster studio that runs directly in your browser with zero sign-up and zero data collection.

## Features

- **QR Code Generator:** Create static QR codes for URLs, plain text, Wi-Fi networks, email, phone numbers, and SMS.
- **Custom Styling:** Customize colors, sizes, frames, custom labels, and center logo overlays.
- **Instant Exports:** Download high-resolution **PNG** and crisp vector **SVG** files.
- **Templates Gallery:** Apply ready-made design presets in one click.
- **QR Poster Maker:** Build printable posters and table stands for restaurants, events, businesses, and Wi-Fi access.
- **QR Scanner:** Decode QR codes locally from uploaded images or your device camera.
- **Bulk QR Creator:** Generate multiple QR codes at once from a list and export individual PNGs or a single ZIP archive.

## Privacy

All QR generation, scanning, poster rendering, and bulk ZIP packaging happen locally in your browser. Your data is never uploaded to a backend server.

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- `qrcode`, `jsqr`, `jszip`

## Local Development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```
