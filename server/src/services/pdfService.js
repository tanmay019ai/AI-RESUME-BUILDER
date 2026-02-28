import puppeteer from 'puppeteer';
import { renderResumeHtml } from '../templates/index.js';
import { getTemplateDef } from '../templates/registry.js';

// Generates a PDF buffer from the resume JSON using a simple HTML template.
export async function generateResumePdf({ templateId, profile, content, isPro, watermark, brandName }) {
  const html = renderResumeHtml({ templateId, profile, content, isPro, watermark, brandName });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    // Set a stable viewport so we can measure overflow reliably.
    await page.setViewport({ width: 794, height: 1123 });
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const def = getTemplateDef(templateId);
    if (def?.singlePage) {
      // Auto-fit loop: shrink font + spacing if content exceeds one page.
      const attempts = [
        { baseFont: 11, sectionGap: 10, lineHeight: 1.42 },
        { baseFont: 10.5, sectionGap: 9, lineHeight: 1.4 },
        { baseFont: 10, sectionGap: 8, lineHeight: 1.38 },
        { baseFont: 9.5, sectionGap: 7, lineHeight: 1.35 },
        { baseFont: 9, sectionGap: 6, lineHeight: 1.32 },
      ];

      for (const a of attempts) {
        // Apply CSS variables. Templates consume these variables.
        // eslint-disable-next-line no-await-in-loop
        await page.evaluate(
          ({ baseFont, sectionGap, lineHeight }) => {
            const root = document.documentElement;
            root.style.setProperty('--base-font', `${baseFont}px`);
            root.style.setProperty('--section-gap', `${sectionGap}px`);
            root.style.setProperty('--line-height', String(lineHeight));
          },
          a
        );

        // eslint-disable-next-line no-await-in-loop
        const fits = await page.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          const scrollH = Math.max(doc.scrollHeight, body.scrollHeight);
          const viewH = doc.clientHeight;
          return scrollH <= viewH;
        });
        if (fits) break;
      }
    }

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '16mm', bottom: '16mm', left: '12mm', right: '12mm' },
    });

    return pdf;
  } finally {
    await browser.close();
  }
}
