# Email Setup for Contact Form

The contact form uses Gmail SMTP to send emails. Follow these steps to set it up:

## 1. Generate Gmail App Password

1. Go to your Google Account settings: https://myaccount.google.com/
2. Select **Security** from the left menu
3. Under "How you sign in to Google", select **2-Step Verification** (you must enable this first if not already enabled)
4. Scroll down and select **App passwords**
5. Select app: **Mail**
6. Select device: **Other (Custom name)** and enter "Elyana Shop"
7. Click **Generate**
8. Copy the 16-character password (without spaces)

## 2. Add Environment Variables

Add these variables to your `.env` or `.env.local` file:

```env
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password
```

**Important:**

- Use your actual Gmail address for `GMAIL_USER`
- Use the 16-character app password (not your regular Gmail password) for `GMAIL_APP_PASSWORD`
- Don't add spaces in the app password

## 3. Restart Development Server

After adding the environment variables, restart your development server:

```bash
npm run dev
```

## How It Works

When a user submits the contact form:

1. **Admin Email**: You receive a notification email with the user's message and contact details
2. **Auto-Reply**: The user receives an automatic confirmation email

Both emails are sent using your Gmail account via SMTP.

## Troubleshooting

If emails aren't sending:

1. Verify 2-Step Verification is enabled on your Google account
2. Double-check the app password (generate a new one if needed)
3. Ensure there are no extra spaces in the `.env` file
4. Check the server console for error messages
5. Make sure your Gmail account allows "Less secure app access" (though app passwords should work regardless)

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- App passwords are safer than using your actual Gmail password
- You can revoke app passwords at any time from your Google Account settings
