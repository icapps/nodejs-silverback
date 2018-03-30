export interface MailClient {
  messages: {
    send: Function;
    sendTemplate: Function;
  };
}

export interface MailOptions {
  message: {
    html?: string;
    text?: string;
    subject?: string;
    from_email: string;
    from_name?: string;
    to: {
      email: string;
      name?: string;
      type?: 'to'
    }[];
    headers?: {};
    bcc_address?: string;
    merge?: boolean;
    merge_language?: 'mailchimp' | 'handlebars';
    global_merge_vars?: {
      name: string;
      content: string;
    }[];
  };
  async?: boolean;
  send_at?: string;
  ip_pool?: string;
}

export interface TemplateMailOptions extends MailOptions {
  template_name: string;
  template_content?: {
    name: string;
    content: string;
  }[];
}

