import { Resend } from 'resend';
import type { SendVerificationRequestParams } from 'next-auth/providers/email';

const resend = new Resend(process.env.AUTH_RESEND_KEY);

/**
 * Sends a verification request email using Resend.
 * This is used by the NextAuth Email provider.
 */
export const sendVerificationRequest = async (params: SendVerificationRequestParams) => {
  const { identifier: email, url, provider } = params;
  
  try {
    const { data, error } = await resend.emails.send({
      from: provider.from,
      to: email,
      subject: 'Sign in to Pulse',
      html: `<p>Click the link below to sign in to your Pulse account:</p><p><a href="${url}"><b>Sign in</b></a></p>`,
    });

    if (error) {
      console.error('Resend API Error:', error);
      throw new Error(`Email could not be sent: ${error.message}`);
    }
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email.');
  }
}; 