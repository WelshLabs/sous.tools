import { Injectable, Logger } from '@nestjs/common';
import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PlaywrightFlipperService {
  private readonly logger = new Logger(PlaywrightFlipperService.name);

  async flipAndExportPdf(
    bookSlug: string,
    url: string,
    maxPages?: number,
    readingAreaSelector?: string,
    customOutputPath?: string,
  ): Promise<string> {
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath =
      customOutputPath || path.join(outputDir, `${bookSlug}.pdf`);

    this.logger.log(`Connecting Playwright Chromium browser to CDP...`);
    // 1. Manually fetch the JSON to securely spoof the Host header
    const response = await fetch('http://172.18.16.1:9222/json/version', {
      headers: { Host: 'localhost:9222' },
    });
    const data: unknown = await response.json();

    // 2. Extract the browser UUID path and force it to use our WSL proxy IP
    const wsPath = new URL(
      (data as { webSocketDebuggerUrl: string }).webSocketDebuggerUrl,
    ).pathname;
    const fixedWsUrl = `ws://172.18.16.1:9222${wsPath}`;

    // 3. Connect Playwright directly to the raw WebSocket
    const browser = await chromium.connectOverCDP(fixedWsUrl);

    // 4. Safely grab the active tab using ES6 destructuring
    const [activeContext] = browser.contexts();
    const [activePage] = activeContext.pages();

    this.logger.log(`Navigating to starting URL: ${url}`);
    await activePage.goto(url);
    await activePage.waitForTimeout(3000);

    this.logger.log(`Injecting CSS to hide Google Books UI elements...`);
    await activePage.addStyleTag({
      content: 'reader-app-bar, reader-scrubber { display: none !important; }',
    });

    const pdfDoc = await PDFDocument.create();
    let previousBuffer: Buffer | null = null;
    const limit = maxPages && maxPages > 0 ? maxPages : 2000;

    for (let i = 1; i <= limit; i++) {
      const paddedI = i.toString().padStart(3, '0');
      this.logger.log(`Capturing screenshot for spread ${paddedI}...`);

      let imageBuffer: Buffer;
      if (readingAreaSelector) {
        try {
          const element = activePage.locator(readingAreaSelector);
          imageBuffer = await element.screenshot();
        } catch (e: unknown) {
          this.logger.warn(
            `Failed to screenshot reading area selector "${readingAreaSelector}": ${e instanceof Error ? e.message : String(e)}. Falling back to page screenshot.`,
          );
          imageBuffer = await activePage.screenshot();
        }
      } else {
        imageBuffer = await activePage.screenshot();
      }

      if (previousBuffer && Buffer.compare(imageBuffer, previousBuffer) === 0) {
        this.logger.log(
          `Identical screenshot detected at spread ${paddedI}. End of book reached. Stopping capture loop.`,
        );
        break;
      }

      this.logger.log(`Embedding spread ${paddedI} into PDF document...`);
      const image = await pdfDoc.embedPng(imageBuffer);
      const pdfPage = pdfDoc.addPage([image.width, image.height]);
      pdfPage.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });

      previousBuffer = imageBuffer;

      this.logger.log(`Turning page horizontally...`);
      await activePage.keyboard.press('ArrowRight');
      this.logger.log(
        `Waiting 2000ms for high-resolution images to lazy load...`,
      );
      await activePage.waitForTimeout(2000);
    }

    await browser.close();

    this.logger.log(`Compiling and saving PDF document to ${outputPath}...`);
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);

    this.logger.log(
      'Playwright Flipper Service PDF export completed successfully.',
    );
    return outputPath;
  }
}
