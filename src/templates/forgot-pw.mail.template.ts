import { mailTemplates } from '../constants';
import { mailSettings } from '../config/app.config';
import { TemplateMailOptions } from '../models/mail.model';


/**
 * Forgot PW initial reset link
 */
export function getForgotPwContent(email: string, token: string): TemplateMailOptions {
  return {
    template_name: mailTemplates.FORGOT_PW_INIT,
    template_content: [],
    message: {
      to: [{ email }],
      from_email: mailSettings.systemEmail,
      subject: 'Choose a new password', // TODO: Correct title: i18n?
      global_merge_vars: [{
        name: 'resetlink',
        content: `${process.env.FE_URL}/forgot-password?token=${token}`,
      }],
    },
  };
}
