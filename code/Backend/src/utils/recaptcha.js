import axios from 'axios';
import { ApiError } from './ApiError.js';

/**
 * Verify reCAPTCHA token with Google's API
 * @param {string} token - The reCAPTCHA token from client
 * @param {string} action - Expected action name
 * @param {number} minScore - Minimum score required (0.0 to 1.0)
 * @returns {Promise<boolean>} - True if verification passes
 */
export const verifyRecaptcha = async (token, action, minScore = 0.5) => {
    if (!token) return false;
    
    try {
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify`,
            null,
            {
                params: {
                    secret: process.env.RECAPTCHA_SECRET_KEY,
                    response: token
                }
            }
        );
        
        const data = response.data;
        
        // Verify the response
        if (!data.success) {
            console.warn('reCAPTCHA verification failed:', data['error-codes']);
            return false;
        }
        
        // Check score (reCAPTCHA v3)
        if (data.score < minScore) {
            console.warn(`reCAPTCHA score too low: ${data.score}`);
            return false;
        }
        
        // Verify action matches
        if (action && data.action !== action) {
            console.warn(`reCAPTCHA action mismatch: ${data.action} vs ${action}`);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        return false;
    }
};