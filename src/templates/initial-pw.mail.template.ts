import { mailTemplates } from '../constants';
import { mailSettings } from '../config/app.config';
import { TemplateMailOptions } from '../models/mail.model';


/**
 * Forgot PW initial reset link
 */
export function getInitialPwChangeContent(email: string, token: string): TemplateMailOptions {
  return {
    template_name: mailTemplates.SET_INITIAL_PW,
    template_content: [],
    message: {
      to: [{ email }],
      from_email: mailSettings.systemEmail,
      subject: 'Welcome! Choose your new password', // TODO: Correct title: i18n?
      global_merge_vars: [
        {
          name: 'email',
          content: email,
        },
        {
          name: 'setlink',
          content: `${process.env.FE_URL}/choose-password?token=${token}`,
        },
      ],
    },
  };
}
