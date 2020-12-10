/* global window */
import en from './en';

export interface LocaleMessage {
  [key: string]: LocaleMessage | string | string[];
}

interface LocaleMessages {
  [key: string]: LocaleMessage;
}

let $lang = 'en';
const $messages: LocaleMessages = {
  en,
};

function translate(key: string, messages: LocaleMessages) {
  if (messages && messages[$lang]) {
    let message: LocaleMessage = messages[$lang];
    const keys = key.split('.');
    for (let i = 0; i < keys.length; i += 1) {
      const property = keys[i];
      const value = message[property];
      if (i === keys.length - 1) return value;
      if (!value) return undefined;
      message = value as LocaleMessage;
    }
  }
  return undefined;
}

export function t(key: string) {
  const v = translate(key, $messages);
  // if (!v && window && window.x_spreadsheet && window.x_spreadsheet.$messages) {
  //   v = translate(key, window.x_spreadsheet.$messages);
  // }
  return v || '';
}

export function tf(key: string) {
  return () => t(key);
}

export function locale(lang: string, message: LocaleMessage) {
  $lang = lang;
  if (message) {
    $messages[lang] = message;
  }
}

export default {
  t,
};
