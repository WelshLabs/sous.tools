import { Injectable, Logger } from '@nestjs/common';
import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PlaywrightFlipperService {
  private readonly logger = new Logger(PlaywrightFlipperService.name);

  async flipAndScreenshot(
    bookSlug: string,
    url: string,
    pageCount: number,
    readingAreaSelector?: string,
  ): Promise<string> {
    const queueDir = path.join(process.cwd(), 'queue', bookSlug);
    if (!fs.existsSync(queueDir)) {
      fs.mkdirSync(queueDir, { recursive: true });
    }

    this.logger.log(`Connecting Playwright Chromium browser to CDP...`);
    // 1. Manually fetch the JSON to securely spoof the Host header
    const response = await fetch('http://172.18.16.1:9222/json/version', {
      headers: { Host: 'localhost:9222' },
    });
    const data: unknown = await response.json();

    // 2. Extract the browser UUID path and force it to use our WSL proxy IP
    const wsPath = new URL(data.webSocketDebuggerUrl).pathname;
    const fixedWsUrl = `ws://172.18.16.1:9222${wsPath}`;

    // 3. Connect Playwright directly to the raw WebSocket
    const browser = await chromium.connectOverCDP(fixedWsUrl);

    // 4. Safely grab the active tab using ES6 destructuring
    const [activeContext] = browser.contexts();
    const [activePage] = activeContext.pages();

    this.logger.log(`Navigating to starting URL: ${url}`);
    await activePage.goto(url);
    await activePage.waitForTimeout(3000);

    for (let i = 1; i <= pageCount; i++) {
      const paddedI = i.toString().padStart(3, '0');
      const outputPath = path.join(queueDir, `spread-${paddedI}.png`);
      this.logger.log(
        `Taking screenshot for spread ${paddedI} (${i}/${pageCount})...`,
      );

      if (readingAreaSelector) {
        try {
          const element = activePage.locator(readingAreaSelector);
          await element.screenshot({ path: outputPath });
        } catch (e: unknown) {
          this.logger.warn(
            `Failed to screenshot reading area selector "${readingAreaSelector}": ${e.message}. Falling back to page screenshot.`,
          );
          await activePage.screenshot({ path: outputPath });
        }
      } else {
        await activePage.screenshot({ path: outputPath });
      }

      this.logger.log(`Saved screenshot to: ${outputPath}`);

      if (i < pageCount) {
        this.logger.log(`Turning page horizontally...`);
        await activePage.keyboard.press('ArrowRight');
        this.logger.log(
          `Waiting 2000ms for high-resolution images to lazy load...`,
        );
        await activePage.waitForTimeout(2000);
      }
    }

    await browser.close();
    this.logger.log('Playwright Flipper Service completed.');
    return queueDir;
  }
}
