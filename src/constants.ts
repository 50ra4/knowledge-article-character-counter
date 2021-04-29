import { config } from 'dotenv';
config();

export const BASE_URL = process.env.BASE_URL || '';
export const LOGIN_ID = process.env.ID || '';
export const LOGIN_PASSWORD = process.env.PASSWORD || '';
export const IS_HEADLESS = process.env.IS_HEADLESS === '1';
export const SLOW_MOTION_MS = IS_HEADLESS ? undefined : 50;
