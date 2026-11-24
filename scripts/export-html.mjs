import { promises as fs } from 'node:fs';
import path from 'node:path';
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/postcss';

/* ============================================================
   OFFLINE PORTFOLIO EXPORT
   Creates one standalone HTML file
   ============================================================ */

const root = process.cwd();
const outArg = process.argv[2];

if (!outArg) {
  throw new Error(
    'Output HTML path required. Example: node scripts/export-html.mjs khalid-portfolio.html'
  );
}

/* ============================================================
   PUBLIC ASSETS
   ============================================================ */

const publicDir = path.join(root, 'public');
const assets = {};

const mimeTypes = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
};

/* ============================================================
   SCAN PUBLIC FOLDER
   ============================================================ */

async function scan(dir) {
  const items = await fs.readdir(dir, {
    withFileTypes: true,
  });

  for (const item of items) {
    const filePath = path.join(dir, item.name);

    if (item.isDirectory()) {
      await scan(filePath);
      continue;
    }

    const ext = path.extname(filePath).toLowerCase();
    const mime = mimeTypes[ext];

    if (!mime) {
      continue;
    }

    const webPath =
      '/' +
      path
        .relative(publicDir, filePath)
        .replaceAll('\\', '/');

    const buffer = await fs.readFile(filePath);

    assets[webPath] =
      `data:${mime};base64,${buffer.toString('base64')}`;
  }
}

await scan(publicDir);

/* ============================================================
   PORTFOLIO CONTENT
   ============================================================ */

const contentPath = path.join(
  publicDir,
  'portfolio-content.json'
);

const data = JSON.parse(
  await fs.readFile(contentPath, 'utf8')
);

/*
   Embed CV directly inside HTML.
*/

if (
  data?.personal?.cvUrl &&
  assets[data.personal.cvUrl]
) {
  data.personal.cvUrl =
    assets[data.personal.cvUrl];
}

/* ============================================================
   TEMPORARY ENTRY FILE
   ============================================================ */

const entry = path.join(
  root,
  '.offline-entry.tsx'
);

await fs.writeFile(
  entry,
  `
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/page';
import './app/globals.css';

createRoot(
  document.getElementById('root')!
).render(<App />);
`,
  'utf8'
);

/* ============================================================
   BUILD
   ============================================================ */

try {
  const result = await build({
    configFile: false,

    define: {
      'process.env.NODE_ENV':
        JSON.stringify('production'),
    },

    root,

    /*
      Do not copy public folder separately.
      Assets will be inside HTML.
    */
    publicDir: false,

    logLevel: 'warn',

    resolve: {
      alias: {
        '@': root,
      },
    },

    css: {
      postcss: {
        plugins: [
          tailwind(),
        ],
      },
    },

    plugins: [
      {
        name: 'offline-portfolio',

        enforce: 'pre',

        transform(source, id) {
          const normalizedId =
            id.replaceAll('\\', '/');

          /* ==================================================
             OFFLINE PORTFOLIO CONTEXT
             ================================================== */

          if (
            normalizedId.endsWith(
              '/app/portfolio-context.tsx'
            )
          ) {
            return `
import React, {
  createContext,
  useContext
} from 'react';

const seed = ${JSON.stringify(data)};

const Context = createContext(seed);

export function PortfolioProvider({
  children
}) {
  return React.createElement(
    Context.Provider,
    {
      value: seed
    },
    children
  );
}

export const usePortfolio = () =>
  useContext(Context);

export const imageUrl = (s) =>
  !s
    ? 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22640%22 height=%22400%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23eaf4ff%22/%3E%3C/svg%3E'
    : (
        s.startsWith('/') ||
        s.startsWith('data:') ||
        s.startsWith('http://') ||
        s.startsWith('https://')
      )
      ? s
      : '/images/' + s + '.webp';
`;
          }

          /* ==================================================
             PAGE IMAGE EMBEDDING
             ================================================== */

          if (
            normalizedId.endsWith(
              '/app/page.tsx'
            )
          ) {
            /*
              IMPORTANT:

              This regex changes BOTH:

              <img src="...">

              AND

              <img
                src="..."
              >

              into OfflineImage.
            */

            const modifiedSource = source
              .replace(
                /<img\b/g,
                '<OfflineImage'
              )
              .replace(
                '<AdminEntry/>',
                ''
              );

            return `
${modifiedSource}

/* ============================================================
   OFFLINE IMAGE COMPONENT
   ============================================================ */

const offlineAssets =
  ${JSON.stringify(assets)};

function resolveOfflineImage(src) {
  if (
    !src ||
    typeof src !== 'string'
  ) {
    return src;
  }

  /*
    Already embedded image
  */

  if (
    src.startsWith('data:') ||
    src.startsWith('blob:')
  ) {
    return src;
  }

  /*
    Keep real online images untouched
  */

  if (
    src.startsWith('http://') ||
    src.startsWith('https://')
  ) {
    return src;
  }

  /*
    Remove query string / hash if present
  */

  const clean =
    src
      .split('?')[0]
      .split('#')[0];

  /*
    Ensure public asset path begins with /
  */

  const normalized =
    clean.startsWith('/')
      ? clean
      : '/' + clean.replace(/^\\.\\//, '');

  /*
    Return Base64 embedded asset
  */

  return (
    offlineAssets[normalized] ||
    offlineAssets[clean] ||
    src
  );
}

function OfflineImage(
  props: React.ImgHTMLAttributes<HTMLImageElement>
) {
  const originalSrc =
    typeof props.src === 'string'
      ? props.src
      : '';

  const resolvedSrc =
    resolveOfflineImage(originalSrc);

  return (
    <img
      {...props}
      src={resolvedSrc}
    />
  );
}
`;
          }
        },
      },

      react(),
    ],

    build: {
      write: false,

      lib: {
        entry,
        formats: ['iife'],
        name: 'KhalidPortfolio',
      },

      cssCodeSplit: false,

      minify: true,
    },
  });

  /* ============================================================
     BUILD OUTPUT
     ============================================================ */

  const outputs = (
    Array.isArray(result)
      ? result
      : [result]
  ).flatMap(
    (resultItem) =>
      resultItem.output
  );

  const js = outputs
    .filter(
      (item) =>
        item.type === 'chunk'
    )
    .map(
      (item) =>
        item.code
    )
    .join('\n');

  const css = outputs
    .filter(
      (item) =>
        item.type === 'asset' &&
        item.fileName.endsWith('.css')
    )
    .map(
      (item) =>
        String(item.source)
    )
    .join('\n');

  if (!js) {
    throw new Error(
      'Missing bundled JavaScript'
    );
  }

  if (!css) {
    throw new Error(
      'Missing bundled CSS'
    );
  }

  /* ============================================================
     CREATE SINGLE HTML
     ============================================================ */

  const safeCss =
    css.replaceAll(
      '</style',
      '<\\/style'
    );

  const safeJs =
    js.replaceAll(
      '</script',
      '<\\/script'
    );

  const html = `<!doctype html>
<html
  lang="en"
  data-offline="true"
>
<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width,initial-scale=1"
>

<title>
Md. Khalid Hasan | GIS, Remote Sensing &amp; Photogrammetry Portfolio
</title>

<meta
  name="description"
  content="Portfolio of Md. Khalid Hasan, a Junior Photogrammetrist and GIS professional specializing in GIS, remote sensing, stereo digitization, spatial analysis and geospatial research."
>

<meta
  property="og:title"
  content="Md. Khalid Hasan | Geospatial Portfolio"
>

<meta
  property="og:type"
  content="website"
>

<meta
  property="og:description"
  content="GIS, remote sensing, photogrammetry and geospatial research portfolio."
>

<style>
${safeCss}
</style>

</head>

<body>

<div id="root"></div>

<noscript>
Please enable JavaScript to view this portfolio.
</noscript>

<script>
${safeJs}
</script>

</body>
</html>`;

  /* ============================================================
     SAVE
     ============================================================ */

  const outputPath =
    path.resolve(
      root,
      outArg
    );

  await fs.mkdir(
    path.dirname(outputPath),
    {
      recursive: true,
    }
  );

  await fs.writeFile(
    outputPath,
    html,
    'utf8'
  );

  /* ============================================================
     SUCCESS MESSAGE
     ============================================================ */

  const sizeMB =
    (
      Buffer.byteLength(html) /
      1024 /
      1024
    ).toFixed(2);

  console.log('');
  console.log(
    '=============================================='
  );

  console.log(
    'OFFLINE PORTFOLIO EXPORT SUCCESSFUL'
  );

  console.log(
    '=============================================='
  );

  console.log(
    `File: ${outputPath}`
  );

  console.log(
    `Size: ${sizeMB} MB`
  );

  console.log(
    `Embedded assets: ${Object.keys(assets).length}`
  );

  console.log(
    'PNG/JPG/WebP images: embedded'
  );

  console.log(
    'GIF images: embedded'
  );

  console.log(
    'Certificate images: embedded'
  );

  console.log(
    'CV PDF: embedded'
  );

  console.log(
    '=============================================='
  );

  console.log('');
}

/* ============================================================
   CLEAN UP TEMP FILE
   ============================================================ */

finally {
  try {
    await fs.unlink(entry);
  } catch {
    // Ignore cleanup error
  }
}