import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const shimmer = (width, height) => `
<svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f3f4f6" stop-opacity="1">
        <animate attributeName="offset" values="-2; 1" dur="2s" repeatCount="indefinite" />
      </stop>
      <stop offset="50%" stop-color="#eaecee" stop-opacity="1">
        <animate attributeName="offset" values="-1; 2" dur="2s" repeatCount="indefinite" />
      </stop>
      <stop offset="100%" stop-color="#f3f4f6" stop-opacity="1">
        <animate attributeName="offset" values="0; 3" dur="2s" repeatCount="indefinite" />
      </stop>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="#f3f4f6" />
  <rect width="${width}" height="${height}" fill="url(#g)" />
</svg>`;

const toBase64 = (str) => (typeof window === 'undefined'
  ? Buffer.from(str).toString('base64')
  : window.btoa(str));

export function imagePlaceholder({ width, height }) {
  return `data:image/svg+xml;base64,${toBase64(shimmer(width, height))}`;
}

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
