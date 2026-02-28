import puppeteer from 'puppeteer';
import { renderResumeHtml } from '../templates/resumeTemplate.js';

// Generates a PDF buffer from the resume JSON using a simple HTML template.
export async function generateResumePdf({ profile, content, isPro, watermark }) {
  const html = renderResumeHtml({ profile, content, isPro, watermark });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

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
