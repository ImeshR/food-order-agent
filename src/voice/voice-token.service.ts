import { Injectable } from '@nestjs/common';
import * as twilio from 'twilio';

/**
 * Generates Twilio Access Tokens for the Voice JavaScript SDK (web calls).
 * The browser uses this token to connect Device and make/receive calls over WebRTC.
 */
@Injectable()
export class VoiceTokenService {
    /**
     * Create a JWT access token for the Twilio Voice JS SDK.
     * @param identity - User identity (alphanumeric + underscore only). Used to scope the token.
     * @returns JWT string, or null if credentials are missing.
     */
    createToken(identity: string): string | null {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const apiKey = process.env.TWILIO_API_KEY;
        const apiSecret = process.env.TWILIO_API_SECRET;
        const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;

        if (!accountSid || !apiKey || !apiSecret || !twimlAppSid) {
            return null;
        }

        // Voice token identity: alphanumeric and underscore only
        const safeIdentity = (identity || 'anonymous').replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 255) || 'anonymous';

        const AccessToken = twilio.jwt.AccessToken;
        const VoiceGrant = AccessToken.VoiceGrant;

        const voiceGrant = new VoiceGrant({
            outgoingApplicationSid: twimlAppSid,
            incomingAllow: true,
        });

        // Region must match where your API Key was created (default US1). Mismatch causes 53000 ConnectionError.
        const region = process.env.TWILIO_VOICE_REGION || 'us1';

        const token = new AccessToken(accountSid, apiKey, apiSecret, {
            identity: safeIdentity,
            ttl: 3600,
            region,
        });
        token.addGrant(voiceGrant);

        return token.toJwt();
    }
}
