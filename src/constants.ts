import { config } from 'dotenv';
config();

export const BASE_URL = process.env.BASE_URL || '';
export const LOGIN_ID = process.env.ID || '';
export const LOGIN_PASSWORD = process.env.PASSWORD || '';
export const IS_HEADLESS = process.env.IS_HEADLESS === '1';
