import { verifyRecaptcha } from '../utils/recaptcha.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const recaptchaMiddleware = (action, minScore = 0.5) => {
    return asyncHandler(async (req, res, next) => {
        // Get the token from the request header or body
        const token = req.body.recaptchaToken || req.headers['x-recaptcha-token'];
        
        if (!token) {
            throw new ApiError(400, 'reCAPTCHA token is required');
        }
        
        const isValid = await verifyRecaptcha(token, action, minScore);
        
        if (!isValid) {
            throw new ApiError(403, 'reCAPTCHA verification failed');
        }
        
        next();
    });
};