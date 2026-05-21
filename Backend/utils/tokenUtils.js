import crypto from 'crypto';

/**
 * Generates a secure random token for invitations.
 * @returns {string} Plain text token
 */
export const generateRawToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Hashes a token for secure storage.
 * @param {string} token - The raw token string
 * @returns {string} Hashed token
 */
export const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};
