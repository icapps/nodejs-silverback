import { mailTemplates } from '../constants';
import { mailSettings } from '../config/app.config';
import { TemplateMailOptions } from '../models/mail.model';


/**
 * Forgot PW initial reset link
 */
export function getForgotPwContent(values: ForgotPwContent): TemplateMailOptions {
  return {
    template_name: mailTemplates.FORGOT_PW_INIT,
    template_content: [],
    message: {
      to: [{ email: values.email }],
      from_email: mailSettings.systemEmail,
      subject: 'Choose a new password',
      global_merge_vars: [
        {
          name: 'resetlink',
          content: `${process.env.FE_URL}/forgot-password?token=${values.token}`,
        },
        {
          name: 'firstname',
          content: values.firstName,
        },
      ],
    },
  };
}

export interface ForgotPwContent {
  email: string;
  token: string;
  firstName: string;
}
