import axios from 'axios';
import config from '../config';

// OAuth provider types
export interface OAuthUserInfo {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  provider: 'GOOGLE' | 'GITHUB';
  rawData?: any;
}

// Google OAuth
export async function getGoogleUserInfo(accessToken: string): Promise<OAuthUserInfo> {
  try {
    const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = response.data;

    return {
      id: data.id,
      email: data.email,
      firstName: data.given_name,
      lastName: data.family_name,
      avatarUrl: data.picture,
      provider: 'GOOGLE',
      rawData: data,
    };
  } catch (error: any) {
    console.error('Google OAuth error:', error.response?.data || error.message);
    throw new Error('Failed to get Google user info');
  }
}

// Exchange Google auth code for tokens
export async function exchangeGoogleCode(code: string): Promise<{ accessToken: string; idToken: string }> {
  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: config.oauth.google.clientId,
      client_secret: config.oauth.google.clientSecret,
      redirect_uri: config.oauth.google.redirectUri,
      grant_type: 'authorization_code',
    });

    return {
      accessToken: response.data.access_token,
      idToken: response.data.id_token,
    };
  } catch (error: any) {
    console.error('Google token exchange error:', error.response?.data || error.message);
    throw new Error('Failed to exchange Google authorization code');
  }
}

// GitHub OAuth
export async function getGitHubUserInfo(accessToken: string): Promise<OAuthUserInfo> {
  try {
    // Get user profile
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const userData = userResponse.data;

    // Get user email (might be private)
    let email = userData.email;
    if (!email) {
      const emailsResponse = await axios.get('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      const primaryEmail = emailsResponse.data.find((e: any) => e.primary);
      email = primaryEmail?.email || emailsResponse.data[0]?.email;
    }

    // Parse name
    let firstName = '';
    let lastName = '';
    if (userData.name) {
      const nameParts = userData.name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }

    return {
      id: userData.id.toString(),
      email,
      firstName,
      lastName,
      avatarUrl: userData.avatar_url,
      provider: 'GITHUB',
      rawData: userData,
    };
  } catch (error: any) {
    console.error('GitHub OAuth error:', error.response?.data || error.message);
    throw new Error('Failed to get GitHub user info');
  }
}

// Exchange GitHub auth code for access token
export async function exchangeGitHubCode(code: string): Promise<string> {
  try {
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: config.oauth.github.clientId,
        client_secret: config.oauth.github.clientSecret,
        code,
        redirect_uri: config.oauth.github.redirectUri,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    if (response.data.error) {
      throw new Error(response.data.error_description || response.data.error);
    }

    return response.data.access_token;
  } catch (error: any) {
    console.error('GitHub token exchange error:', error.response?.data || error.message);
    throw new Error('Failed to exchange GitHub authorization code');
  }
}

// Generate OAuth URLs
export function getGoogleAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: config.oauth.google.clientId,
    redirect_uri: config.oauth.google.redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function getGitHubAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: config.oauth.github.clientId,
    redirect_uri: config.oauth.github.redirectUri,
    scope: 'user:email read:user',
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

// Check if OAuth providers are configured
export function isGoogleConfigured(): boolean {
  return !!(config.oauth.google.clientId && config.oauth.google.clientSecret);
}

export function isGitHubConfigured(): boolean {
  return !!(config.oauth.github.clientId && config.oauth.github.clientSecret);
}
