Secret Santa server

Configuration

1. Copy `.env.example` to `.env` and fill the SMTP credentials with your provider info.

   cp .env.example .env
   # then edit .env and set EMAIL_USER, EMAIL_PASS, EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE

2. Start the server (development):

   PORT=3000 npx nodemon index.mjs

   or

   PORT=3000 node index.mjs

Behavior

- If SMTP credentials are provided in `.env`, the server will use them to send real emails.
- If no credentials are present, the server falls back to Ethereal (development-only) and will not send real messages.
- After sending, the server writes `assignments.json` with timestamp, assignments and results. This file is overwritten on each send.

Security

- Do not commit `.env` or real credentials to the repository. Keep `.env` private.