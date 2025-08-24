import qs from 'qs';
import { Linking } from 'react-native';

interface EmailOptions {
  cc?: string;
  bcc?: string;
}

export const sendEmail = async (
  to: string,
  subject: string,
  body: string,
  options: EmailOptions = {},
): Promise<boolean> => {
  const { cc, bcc } = options;

  let url = `mailto:${to}`;

  const query = qs.stringify({
    subject,
    body,
    cc,
    bcc,
  });

  if (query.length) {
    url += `?${query}`;
  }

  const canOpen = await Linking.canOpenURL(url);

  if (!canOpen) {
    throw new Error('Provided URL can not be handled');
  }

  return Linking.openURL(url);
};
