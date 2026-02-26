# Web calls via Twilio Client SDK

This app supports **browser-based voice calls** using the [Twilio Voice JavaScript SDK](https://www.twilio.com/docs/voice/sdks/javascript). The browser connects to Twilio over WebRTC; Twilio then requests TwiML from your server (your existing `/voice` handler) to control the call.

## 1. Twilio setup

### Create a TwiML App

1. Open [Twilio Console → Phone Numbers → Manage → TwiML Apps](https://console.twilio.com/us1/develop/phone-numbers/manage/twiml-apps).
2. Create a new TwiML App.
3. Set **Voice URL** to your server’s voice endpoint, e.g.  
   `https://your-domain.com/voice`  
   For local dev you can use a tunnel (ngrok, etc.):  
   `https://abc123.ngrok.io/voice`
4. Save and copy the **TwiML App SID** (starts with `AP...`).

### Create an API Key (for tokens)

1. Go to [Account → API keys & tokens](https://console.twilio.com/us1/account/keys-credentials/api-keys).
2. Create an API Key, copy the **SID** and **Secret** (the secret is shown only once).

### Environment variables

Add to your `.env`:

```env
# Existing (e.g. for other Twilio usage)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Required for Voice web SDK access tokens
TWILIO_API_KEY=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_SECRET=your_api_key_secret
TWILIO_TWIML_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

- **TWILIO_ACCOUNT_SID** – from Twilio Console.
- **TWILIO_API_KEY** / **TWILIO_API_SECRET** – from the API Key you created. **Create the key in the US1 region** (see region selector in the Twilio Console when creating the key) to avoid ConnectionError 53000.
- **TWILIO_TWIML_APP_SID** – the TwiML App SID from step 1.
- **TWILIO_VOICE_REGION** (optional) – default `us1`. Set only if you use an API Key from another region (e.g. `au1`).

## 2. Backend (this repo)

- **GET `/voice/token?identity=user_name`**  
  Returns a JSON object `{ "token": "eyJ..." }` with a short-lived JWT.  
  The browser uses this token with the Twilio Voice JS SDK; no token is returned if the env vars above are missing.

- **POST `/voice`**  
  Your existing TwiML endpoint. When a web call is placed, Twilio requests this URL and uses the returned TwiML (e.g. `<Say>`, `<Gather>`) to drive the call.

## 3. Browser test page

A minimal test page is served at:

- **http://localhost:3000/voice-client.html** (when the app is running)

**First-time setup:** The page uses a bundled Twilio SDK. Build it once (or after changing `client/voice-client-main.js`) with:

```bash
npm run build:voice
```

This writes `public/voice-client-bundle.js`. The Nest app serves it with the HTML.

It:

1. Fetches a token from `GET /voice/token`.
2. Uses `@twilio/voice-sdk` `Device` to register and connect.
3. Lets you click **Call** to start a call. Twilio will request your `/voice` TwiML; you can leave “Call target” empty to only run TwiML (e.g. AI agent) or set a number to dial out.

For local testing, expose your server with a tunnel (e.g. ngrok) and set the TwiML App Voice URL to `https://your-tunnel.ngrok.io/voice`.

## 4. Using the Voice SDK in your own frontend

1. Install the SDK:  
   `npm install @twilio/voice-sdk`

2. Get a token from your backend:  
   `const res = await fetch('/voice/token?identity=my_user'); const { token } = await res.json();`

3. Create a Device and register:

   ```js
   import { Device } from '@twilio/voice-sdk';

   const device = new Device(token, { logLevel: 1 });
   device.on('registered', () => console.log('Ready'));
   device.on('tokenWillExpire', async () => {
     const { token } = await (await fetch('/voice/token?identity=my_user')).json();
     device.updateToken(token);
   });
   await device.register();
   ```

4. Place a call (Twilio will then request your TwiML from the TwiML App’s Voice URL):

   ```js
   const call = await device.connect({ params: { To: '+15551234567' } }); // optional
   call.on('accept', () => console.log('Connected'));
   call.on('disconnect', () => console.log('Ended'));
   ```

5. Hang up:  
   `call.disconnect();`

## 5. Troubleshooting

### ConnectionError (53000): signaling connection error

The browser could not establish the WebSocket signaling connection to Twilio. Common causes:

1. **API Key region mismatch**  
   The token targets a region (default `us1`). Your API Key must have been **created in that same region**.  
   - **Fix:** In [Twilio Console → API keys](https://console.twilio.com/us1/account/keys-credentials/api-keys), switch the region (top-right) to **US1**, then create a new API Key and use its SID and Secret in `.env`.  
   - Or if you intentionally use another region: set `TWILIO_VOICE_REGION` in `.env` to that region (e.g. `au1`) and ensure your API Key and TwiML App were created in that region.

2. **Firewall / proxy**  
   Outbound WebSocket (wss) to Twilio may be blocked. Try from another network (e.g. mobile hotspot) or ask your IT to allow Twilio.

3. **Transient**  
   Retry once or twice; sometimes the connection fails briefly.

## 6. References

- [Twilio Voice JavaScript SDK](https://www.twilio.com/docs/voice/sdks/javascript)
- [Access Tokens (Voice)](https://www.twilio.com/docs/iam/access-tokens#create-an-access-token-for-voice)
- [TwiML Apps](https://www.twilio.com/docs/voice/twiml-apps)
