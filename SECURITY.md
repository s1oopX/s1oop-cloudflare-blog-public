# Security Policy

## Reporting

If you find a security issue, do not open a public issue with exploit details.

Report it privately to the repository owner through GitHub, or by email if a contact address is provided on the profile.

## Secrets

This project expects secrets to be configured outside Git:

- Local development: `.dev.vars`
- Cloudflare Pages: environment variables
- Cloudflare Workers: secrets or environment variables

Never commit:

- Cloudflare API tokens
- GitHub write tokens
- Passwords or private keys
- `.dev.vars`
- `.env`

## Private Entry

The public copy does not include the owner's private login route, admin UI, or GitHub publishing API.

If you build a private entry for your own fork, keep the implementation private or isolate it behind your own route, authentication, and deployment-specific secrets.
