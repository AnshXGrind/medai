// Simple client-side content safety helper
// Detects harmful intents via keyword matching and returns a category

export type HarmType = 'self-harm' | 'poisoning' | 'violence' | 'weapons' | 'illegal' | 'other';

const keywordMap: Record<HarmType, string[]> = {
  'self-harm': [
    'suicide',
    'kill myself',
    'i want to die',
    'end my life',
    'hang myself',
    'hurt myself'
  ],
  'poisoning': [
    'poison',
    'how to poison',
    'how to poison someone',
    'how to poison a person',
    'how to make poison',
    'chemicals to kill',
    'poison someone'
  ],
  'violence': [
    'kill',
    'murder',
    'stab',
    'beat someone',
    'hurt someone'
  ],
  'weapons': [
    'bomb',
    'explosive',
    'gun',
    'make a bomb',
    'weapon'
  ],
  'illegal': [
    'hack bank',
    'illegal',
    'drug recipe',
    'sell drugs'
  ],
  'other': [
    'how to bypass',
    'bypass security',
    'evade'
  ]
};

function normalize(text: string) {
  return text.trim().toLowerCase();
}

export function getHarmType(text: string): HarmType | null {
  const s = normalize(text);
  for (const type of Object.keys(keywordMap) as HarmType[]) {
    for (const keyword of keywordMap[type]) {
      if (s.includes(keyword)) return type;
    }
  }
  return null;
}

export function isHarmful(text?: string | null): boolean {
  if (!text) return false;
  return getHarmType(text) !== null;
}

export function safeAssistantResponse(type: HarmType | null) {
  if (!type) type = 'other';
  if (type === 'self-harm') {
    return `I'm really sorry that you're feeling this way. I can't help with instructions about self-harm. Please contact your local emergency services or visit the emergency help page for immediate assistance.`;
  }
  return `I can't assist with requests related to ${type}. If someone is in immediate danger please contact your local emergency services or visit the emergency help page.`;
}

export default {
  isHarmful,
  getHarmType,
  safeAssistantResponse
};
