import { OAuth2Client } from 'google-auth-library';
import { Request, Response } from 'express';

const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_GOOGLE_CLIENT_SECRET';
const REDIRECT_URI = 'YOUR_REDIRECT_URI';

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

export const getAuthUrl = (): string => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
    });
    return authUrl;
};

export const getToken = async (code: string): Promise<any> => {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
};

export const getUserInfo = async (): Promise<any> => {
    const res = await oauth2Client.request({ url: 'https://www.googleapis.com/oauth2/v3/userinfo' });
    return res.data;
};