import enUS from './en-US.json';
import hiIN from './hi-IN.json';
import idID from './id-ID.json';
import bnBD from './bn-BD.json';
import deDE from './de-DE.json';
import esES from './es-ES.json';
import frFR from './fr-FR.json';
import huHU from './hu-HU.json';
import bgBG from './bg-BG.json';
import itIT from './it-IT.json';
import jaJP from './ja-JP.json';
import ruRU from './ru-RU.json';
import trTR from './tr-TR.json';
import koKR from './ko-KR.json';
import ukUA from './uk-UA.json';
import ltLT from './lt-LT.json';
import fiFI from './fi-FI.json';
import filPH from './fil-PH.json';
import ptPT from './pt-PT.json';
import plPL from './pl-PL.json';
import srCS from './sr-CS.json';
import faIR from './fa-IR.json';
import arSA from './ar-SA.json';
import azAZ from './az-AZ.json';
import uzUZ from './uz-UZ.json';
import roRO from './ro-RO.json';
import msMY from './ms-MY.json';
import kuTR from './ku-TR.json';
import viVN from './vi-VN.json';
import zhCN from './zh-CN.json';
import zhTW from './zh-TW.json';
import etEE from './et-EE.json';

const messages: Record<string, typeof enUS> = {
  'en-US': enUS,
  'hi-IN': hiIN,
  'id-ID': idID,
  'bn-BD': bnBD,
  'de-DE': deDE,
  'es-ES': esES,
  'fr-FR': frFR,
  'hu-HU': huHU,
  'bg-BG': bgBG,
  'it-IT': itIT,
  'ja-JP': jaJP,
  'ru-RU': ruRU,
  'tr-TR': trTR,
  'ko-KR': koKR,
  'uk-UA': ukUA,
  'lt-LT': ltLT,
  'fi-FI': fiFI,
  'fil-PH': filPH,
  'pt-PT': ptPT,
  'pl-PL': plPL,
  'sr-CS': srCS,
  'fa-IR': faIR,
  'ar-SA': arSA,
  'az-AZ': azAZ,
  'uz-UZ': uzUZ,
  'ro-RO': roRO,
  'ms-MY': msMY,
  'ku-TR': kuTR,
  'vi-VN': viVN,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'et-EE': etEE,
};

export default messages;

export const locales = [
  { id: 'en-US', name: 'English' },
  { id: 'hi-IN', name: 'Hindi' },
  { id: 'id-ID', name: 'Indonesian' },
  { id: 'bn-BD', name: 'Bengali' },
  { id: 'de-DE', name: 'Deutsche' },
  { id: 'es-ES', name: 'Spanish' },
  { id: 'fr-FR', name: 'French' },
  { id: 'hu-HU', name: 'Hungarian' },
  { id: 'bg-BG', name: 'Bulgarian' },
  { id: 'it-IT', name: 'Italian' },
  { id: 'ja-JP', name: 'Japanese' },
  { id: 'ru-RU', name: 'Русский' },
  { id: 'tr-TR', name: 'Türkçe' },
  { id: 'ko-KR', name: 'Korean' },
  { id: 'uk-UA', name: 'Ukrainian' },
  { id: 'lt-LT', name: 'Lithuanian' },
  { id: 'fi-FI', name: 'Finnish' },
  { id: 'fil-PH', name: 'Filipino' },
  { id: 'pt-PT', name: 'Porteguese' },
  { id: 'et-EE', name: 'Estonian' },
  { id: 'pl-PL', name: 'Polish' },
  { id: 'sr-CS', name: 'Serbian' },
  { id: 'fa-IR', name: 'Persian' },
  { id: 'ar-SA', name: 'Arabic' },
  { id: 'az-AZ', name: 'Azerbaijani' },
  { id: 'uz-UZ', name: "O'zbek" },
  { id: 'ro-RO', name: 'Romanian' },
  { id: 'ms-MY', name: 'Malay' },
  { id: 'ku-TR', name: 'Kurdish' },
  { id: 'vi-VN', name: 'Vietnamese' },
  { id: 'zh-CN', name: 'Chinese-Simplified' },
  { id: 'zh-TW', name: 'Chinese-Traditional' },
];
