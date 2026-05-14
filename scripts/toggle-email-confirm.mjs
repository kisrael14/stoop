// Usage:
//   node scripts/toggle-email-confirm.mjs <access-token> off
//   node scripts/toggle-email-confirm.mjs <access-token> on
//
// Get your access token at: https://supabase.com/dashboard/account/tokens

const PROJECT_REF = 'iaytzhubgfnvmbslnnzy';
const [,, accessToken, mode] = process.argv;

if (!accessToken || !['on', 'off'].includes(mode)) {
  console.error('Usage: node scripts/toggle-email-confirm.mjs <access-token> on|off');
  console.error('Get your token at: https://supabase.com/dashboard/account/tokens');
  process.exit(1);
}

const autoConfirm = mode === 'off'; // off = autoconfirm on (skip email)

const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
  method: 'PATCH',
  headers: {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ mailer_autoconfirm: autoConfirm }),
});

const data = await res.json();
if (res.ok) {
  console.log(mode === 'off'
    ? '✓ Email confirmation OFF — anyone can sign up instantly.'
    : '✓ Email confirmation ON — users must confirm their email.'
  );
} else {
  console.error('Error:', JSON.stringify(data, null, 2));
}
