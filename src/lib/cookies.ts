
/**
 * Cookie utility functions for secure token storage
 * Provides methods to set, get, and remove cookies with proper security settings
 * Falls back to sessionStorage if cookies are not available
 */

interface CookieOptions {
  expires?: Date;
  maxAge?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  httpOnly?: boolean;
}

/**
 * Set a cookie with secure defaults
 */
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): void {
  const {
    expires,
    maxAge,
    path = "/",
    domain,
    secure = true,
    sameSite = "Strict",
    httpOnly = false,
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (expires) {
    cookieString += `; expires=${expires.toUTCString()}`;
  }

  if (maxAge) {
    cookieString += `; max-age=${maxAge}`;
  }

  if (path) {
    cookieString += `; path=${path}`;
  }

  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  if (secure) {
    cookieString += "; secure";
  }

  if (sameSite) {
    cookieString += `; samesite=${sameSite}`;
  }

  if (httpOnly) {
    cookieString += "; httponly";
  }

  // Note: httpOnly cookies can only be set by the server
  // For client-side cookies, we'll use secure defaults
  document.cookie = cookieString;
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  const nameEQ = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split(";");

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }

  return null;
}

/**
 * Remove a cookie by setting it to expire in the past
 */
export function removeCookie(name: string, path: string = "/"): void {
  document.cookie = `${encodeURIComponent(
    name
  )}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
}

/**
 * Check if cookies are supported/enabled
 */
export function areCookiesEnabled(): boolean {
  try {
    const testCookie = "test_cookie";
    setCookie(testCookie, "test", { maxAge: 1 });
    const exists = getCookie(testCookie) !== null;
    removeCookie(testCookie);
    return exists;
  } catch {
    return false;
  }
}

/**
 * Secure storage interface that uses cookies when available, falls back to sessionStorage
 */
class SecureStorage {
  private useCookies: boolean;

  constructor() {
    this.useCookies = areCookiesEnabled();
  }

  setItem(key: string, value: string): void {
    if (this.useCookies) {
      setCookie(key, value, {
        maxAge: 24 * 60 * 60, // 24 hours
        path: "/",
        secure: true,
        sameSite: "Strict",
      });
    } else {
      // Fallback to sessionStorage (more secure than localStorage)
      sessionStorage.setItem(key, value);
    }
  }

  getItem(key: string): string | null {
    if (this.useCookies) {
      return getCookie(key);
    } else {
      return sessionStorage.getItem(key);
    }
  }

  removeItem(key: string): void {
    if (this.useCookies) {
      removeCookie(key);
    } else {
      sessionStorage.removeItem(key);
    }
  }

  clear(): void {
    if (this.useCookies) {
      removeCookie("wms_token");
      removeCookie("wms_user");
    } else {
      sessionStorage.removeItem("wms_token");
      sessionStorage.removeItem("wms_user");
    }
  }
}

// Create singleton instance
const secureStorage = new SecureStorage();

/**
 * Token-specific cookie functions with secure defaults
 */
export const tokenCookies = {
  /**
   * Set authentication token cookie
   */
  setToken: (token: string) => {
    secureStorage.setItem("wms_token", token);
  },

  /**
   * Get authentication token
   */
  getToken: (): string | null => {
    return secureStorage.getItem("wms_token");
  },

  /**
   * Remove authentication token
   */
  removeToken: () => {
    secureStorage.removeItem("wms_token");
  },

  /**
   * Set user data cookie (for non-sensitive user info)
   */
  setUser: (userData: string) => {
    secureStorage.setItem("wms_user", userData);
  },

  /**
   * Get user data
   */
  getUser: (): string | null => {
    return secureStorage.getItem("wms_user");
  },

  /**
   * Remove user data
   */
  removeUser: () => {
    secureStorage.removeItem("wms_user");
  },

  /**
   * Clear all auth-related cookies
   */
  clearAll: () => {
    secureStorage.clear();
  },
};
