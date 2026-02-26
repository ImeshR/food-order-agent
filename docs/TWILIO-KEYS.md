# Where to find Twilio keys

You need **4 values** for web calls. Here’s where each one lives.

---

## 1. **Account SID** → `TWILIO_ACCOUNT_SID`

- **Starts with:** `AC` (e.g. `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
- **Where:** Twilio Console **dashboard** (first thing you see after login), or  
  **Account** (top right) → **Account info** → **Account SID**
- [Direct link: Account / API keys](https://console.twilio.com/us1/account/keys-credentials/api-keys) — Account SID is on that page under “Account info”

---

## 2. **API Key SID** → `TWILIO_API_KEY`

- **Starts with:** `SK` (e.g. `SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
- **Where:** **Account** → **API keys & tokens** → **API keys**  
  Each row is one API key; the **SID** column is the value you need. You can always see the SID here; you cannot see the Secret again after creation.
- [Direct link: API keys](https://console.twilio.com/us1/account/keys-credentials/api-keys)

**If you only have the Secret:**  
The **SID** of that same key is in the **API keys** table. Click **API keys** in the left sidebar and match the key you created (by date or label). Use that row’s SID as `TWILIO_API_KEY`.

---

## 3. **API Key Secret** → `TWILIO_API_SECRET`

- **Looks like:** A long random string (no fixed prefix)
- **Where:** Shown **only once** when you click **Create API Key** and then **Create**. There is no way to see it again in the console.
- **If you lost it:** Create a **new** API Key in the same place. You’ll get a new SID and Secret; use both in `.env` as `TWILIO_API_KEY` and `TWILIO_API_SECRET`.

---

## 4. **TwiML App SID** → `TWILIO_TWIML_APP_SID`

- **Starts with:** `AP` (e.g. `APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
- **Where:** **Phone Numbers** (left menu) → **Manage** → **TwiML Apps**  
  Create an app or open an existing one; the **SID** is on that app’s page.
- [Direct link: TwiML Apps](https://console.twilio.com/us1/develop/phone-numbers/manage/twiml-apps)
- Set the app’s **Voice URL** to your backend (e.g. `https://your-server.com/voice`).

---

## Summary

| You have / see            | Use as              | Where it is |
|---------------------------|---------------------|-------------|
| Account SID (`AC...`)     | `TWILIO_ACCOUNT_SID`| Dashboard or Account → Account info |
| API Key SID (`SK...`)     | `TWILIO_API_KEY`    | Account → API keys & tokens → API keys (table) |
| API Key Secret (long string) | `TWILIO_API_SECRET` | Only at API Key creation; if lost, create new key |
| TwiML App SID (`AP...`)   | `TWILIO_TWIML_APP_SID` | Phone Numbers → Manage → TwiML Apps |

**Note:** The main **Auth Token** (Account → API keys & tokens) is **not** used for Voice SDK tokens. You must use an **API Key** (SID + Secret) for `TWILIO_API_KEY` and `TWILIO_API_SECRET`.
