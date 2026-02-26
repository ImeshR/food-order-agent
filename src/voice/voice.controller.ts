import { Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AiService } from '../ai/ai.service';
import { OrderService } from '../order/order.service';
import { VoiceTokenService } from './voice-token.service';

@Controller('voice')
export class VoiceController {
    constructor(
        private readonly aiService: AiService,
        private readonly orderService: OrderService,
        private readonly voiceTokenService: VoiceTokenService,
    ) {}

    /**
     * GET /voice/token?identity=user_name
     * Returns a Twilio Access Token for the Voice JavaScript SDK (web calls).
     * The browser uses this token with Device.register() to make/receive calls.
     */
    @Get('token')
    getToken(@Query('identity') identity: string) {
        const token = this.voiceTokenService.createToken(identity || '');
        if (!token) {
            return {
                error: 'Voice token not configured. Set TWILIO_ACCOUNT_SID, TWILIO_API_KEY, TWILIO_API_SECRET, TWILIO_TWIML_APP_SID.',
            };
        }
        return { token };
    }

    /**
     * GET /voice/token/debug
     * Decodes the JWT without the secret to show header/payload for troubleshooting.
     * Safe to use locally – does NOT expose the signing secret.
     */
    @Get('token/debug')
    getTokenDebug(@Query('identity') identity: string) {
        const token = this.voiceTokenService.createToken(identity || 'debug_user');
        if (!token) {
            return { error: 'Credentials not configured. Check your .env.' };
        }
        const [rawHeader, rawPayload] = token.split('.');
        const header = JSON.parse(Buffer.from(rawHeader, 'base64url').toString());
        const payload = JSON.parse(Buffer.from(rawPayload, 'base64url').toString());
        return {
            header,
            payload: {
                ...payload,
                grants: payload.grants,
            },
            hints: {
                region_in_token: header.twr ?? '(not set – defaults to us1)',
                account_sid_prefix: (payload.sub || '').slice(0, 6),
                api_key_prefix: (payload.iss || '').slice(0, 6),
                twiml_app_sid: payload.grants?.voice?.outgoing?.application_sid ?? '(missing)',
                expires_in_seconds: payload.exp - Math.floor(Date.now() / 1000),
            },
        };
    }

    @Post()
    async handleVoice(@Req() req: Request, @Res() res: Response) {
        const speechText: string | undefined = req.body.SpeechResult;
        const callSid: string = req.body.CallSid || 'unknown';

        res.type('text/xml');

        // First call from Twilio has no SpeechResult — send greeting immediately
        if (!speechText) {
            res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="/voice" method="POST" timeout="10" speechTimeout="3">
    <Say>Welcome to our food ordering service! What would you like to order today?</Say>
  </Gather>
  <Redirect method="POST">/voice</Redirect>
</Response>`);
            return;
        }

        try {
            const state = this.orderService.getState(callSid);

            const aiResponse = await this.aiService.processMessage(speechText, state);

            if (aiResponse.item || aiResponse.size || aiResponse.quantity || aiResponse.address) {
                this.orderService.updateState(callSid, aiResponse);
            }

            const reply = (aiResponse.reply || 'Sorry, can you repeat that?')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');

            res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="/voice" method="POST" timeout="10" speechTimeout="3">
    <Say>${reply}</Say>
  </Gather>
  <Redirect method="POST">/voice</Redirect>
</Response>`);
        } catch (err) {
            console.error('Voice handler error:', err);
            res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="/voice" method="POST" timeout="10" speechTimeout="3">
    <Say>Sorry, something went wrong. Please try again.</Say>
  </Gather>
  <Redirect method="POST">/voice</Redirect>
</Response>`);
        }
    }
}
