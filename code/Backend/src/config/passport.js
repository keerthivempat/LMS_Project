import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/schema.model.js';
import { generateAccessAndRefreshToken } from '../controllers/auth.controller.js';

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
            proxy: true
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    // User exists, generate new tokens
                    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
                    user.accessToken = accessToken;
                    user.refreshToken = refreshToken;
                    return done(null, user);
                }

                // Create new user
                user = await User.create({
                    googleId: profile.id,
                    name: profile.displayName,
                    username: profile.emails[0].value.split('@')[0], // Use email prefix as username
                    email: profile.emails[0].value,
                    picture: profile.photos[0].value,
                    isEmailVerified: true, // Google emails are pre-verified
                    isActive: true
                });

                // Generate tokens
                const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
                user.accessToken = accessToken;
                user.refreshToken = refreshToken;

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport; 