export const DEFAULT_ACCESS_EXPIRY = "15m";
export const DEFAULT_REFRESH_EXPIRY = "7d";
export const DEFAULT_ACCESS_EXPIRY_REMEMBER_ME = "30d";
export const DEFAULT_REFRESH_EXPIRY_REMEMBER_ME = "90d";

export function getAccessTokenExpiry(rememberMe?: boolean): string {
    return rememberMe
        ? (process.env.JWT_EXPIRES_IN_REMEMBER_ME ?? DEFAULT_ACCESS_EXPIRY_REMEMBER_ME)
        : (process.env.JWT_EXPIRES_IN ?? DEFAULT_ACCESS_EXPIRY);
}

export function getRefreshTokenExpiry(rememberMe?: boolean): string {
    return rememberMe
        ? (process.env.JWT_REFRESH_EXPIRES_IN_REMEMBER_ME ?? DEFAULT_REFRESH_EXPIRY_REMEMBER_ME)
        : (process.env.JWT_REFRESH_EXPIRES_IN ?? DEFAULT_REFRESH_EXPIRY);
}
