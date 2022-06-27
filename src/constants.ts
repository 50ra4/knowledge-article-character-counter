import { join } from 'path';
import { config } from 'dotenv';
import { Viewport } from 'puppeteer';
config();

export const BASE_URL = process.env.BASE_URL || '';
export const LOGIN_ID = process.env.ID || '';
export const LOGIN_PASSWORD = process.env.PASSWORD || '';
export const IS_HEADLESS = process.env.IS_HEADLESS === '1';
export const SLOW_MOTION_MS = IS_HEADLESS ? undefined : 50;
export const LOGIN_PAGE_URL = join(BASE_URL, 'signin');
export const VIEW_PAGE_URL = join(BASE_URL, 'open.knowledge', 'view');
export const DRAFT_VIEW_PAGE_URL = join(BASE_URL, 'protect.draft', 'view');
export const DEFAULT_VIEW_PORT: Readonly<Viewport> = {
  width: 1280,
  height: 800,
};
export const EXECUTABLE_PATH = process.env.EXECUTABLE_PATH || '';
