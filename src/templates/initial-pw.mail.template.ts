import { mailTemplates } from '../constants';
import { mailSettings } from '../config/app.config';
import { TemplateMailOptions } from '../models/mail.model';

/**
 * Forgot PW initial reset link
 */
export function getInitialPwChangeContent(values: InitialPwContent): TemplateMailOptions {
  return {
    template_name: mailTemplates.SET_INITIAL_PW,
    template_content: [],
    message: {
      to: [{ email: values.email }],
      from_email: mailSettings.systemEmail,
      subject: 'Welcome! Choose your new password',
      global_merge_vars: [
        {
          name: 'email',
          content: values.email,
        },
        {
          name: 'setlink',
          content: `${process.env.FE_URL}/choose-password?token=${values.token}`,
        },
        {
          name: 'firstname',
          content: values.firstName,
        },
      ],
    },
  };
}

export interface InitialPwContent {
  email: string;
  token: string;
  firstName: string;
}
