// Use your preferred SMS service (Twilio, Vonage, etc.)
export const sendSMS = async (options) => {
    // Example using Twilio
    const client = require('twilio')(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
    );

    await client.messages.create({
        body: options.message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: options.to
    });
};