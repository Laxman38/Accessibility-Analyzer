import { JSDOM } from 'jsdom';
import axeCore from 'axe-core';
import axeSource from 'axe-core/axe.min.js';
import puppeteer from 'puppeteer';

const runAxeScanOnHtml = async (html) => {
  try {
    const dom = new JSDOM(html, {
      runScripts: 'dangerously',
      resources: 'usable',
      pretendToBeVisual: true
    });

    const { window } = dom;

    const script = window.document.createElement('script');
    script.textContent = axeCore.source;
    window.document.head.appendChild(script);

    const axeConfig = {
      rules: {
        'color-contrast': { enabled: true },
        'image-alt': { enabled: true },
        'label': { enabled: true }
      },
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']
    };

    return new Promise((resolve, reject) => {
      window.axe.run(window.document, axeConfig, (err, results) => {
        if (err) return reject(new Error(`Axe scan failed: ${err.message}`));
        resolve(results);
      });
    });

  } catch (error) {
    throw new Error(`HTML scan failed: ${error.message}`);
  }
};

const runAxeScanOnUrl = async (url) => {
  if (!url) throw new Error('URL is required');

  let browser;
  try {
    console.log(`Launching browser and visiting: ${url}`);

    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    if (!response) throw new Error('Failed to load page');

    const headers = response.headers();
    const csp = headers['content-security-policy'] || '';
    if (csp.includes('trusted-types')) {
      throw new Error(`This site uses Trusted Types and blocks script injection (CSP: ${csp})`);
    }

    await page.evaluate(axeCore.source);

    const hasAxe = await page.evaluate(() => typeof window.axe === 'object' || typeof window.axe === 'function');
    if (!hasAxe) {
      throw new Error('axe not available in page context');
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const axeConfig = {
      rules: {
        'color-contrast': { enabled: true },
        'image-alt': { enabled: true },
        'label': { enabled: true }
      },
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']
    };

    const results = await page.evaluate(async (config) => {
      return await window.axe.run(document, config);
    }, axeConfig);

    return results;

  } catch (error) {
    throw new Error(`URL scan failed: ${error.message}`);
  } finally {
    if (browser) await browser.close();
  }
};

const getFixRecommendations = (violationId) => {
  const recommendations = {
    'image-alt': {
      title: 'Missing Alt Text',
      explanation: 'Images must have alternative text for screen readers to describe the image content.',
      fix: 'Add a descriptive alt attribute to your image tags.',
      codeExample: '<img src="logo.png" alt="Company Logo" />',
      wcagReference: 'WCAG 1.1.1 - Non-text Content',
      severity: 'error',
      learnMore: 'https://www.w3.org/WAI/tutorials/images/'
    },
    'color-contrast': {
      title: 'Insufficient Color Contrast',
      explanation: 'Text must have sufficient contrast against background colors for readability.',
      fix: 'Ensure text has a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text.',
      codeExample: 'color: #333; background-color: #fff; /* Good contrast ratio */',
      wcagReference: 'WCAG 1.4.3 - Contrast (Minimum)',
      severity: 'error',
      learnMore: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html'
    },
    'label': {
      title: 'Form Input Without Label',
      explanation: 'Form inputs must be associated with labels for screen reader accessibility.',
      fix: 'Associate form inputs with labels using the "for" attribute or wrap inputs in label tags.',
      codeExample: `<label for="email">Email:</label>\n<input type="email" id="email" name="email" />`,
      wcagReference: 'WCAG 1.3.1 - Info and Relationships',
      severity: 'error',
      learnMore: 'https://www.w3.org/WAI/tutorials/forms/labels/'
    },
  };

  return recommendations[violationId] || {
    title: 'Accessibility Issue',
    explanation: 'This element has an accessibility issue that needs attention.',
    fix: 'Please review the element and follow WCAG guidelines.',
    wcagReference: 'WCAG Guidelines',
    severity: 'warning',
    learnMore: 'https://www.w3.org/WAI/WCAG21/'
  };
};

export { runAxeScanOnHtml, runAxeScanOnUrl, getFixRecommendations };
