const ABUSIVE_WORDS = [
  'abuse', 'assault', 'bastard', 'bitch', 'damn', 'dammit', 'fuck', 'fucked', 'fucking',
  'hell', 'shit', 'shitty', 'asshole', 'motherfucker', 'prick', 'dick', 'cock', 'pussy',
  'whore', 'slut', 'cunt', 'nigger', 'fag', 'faggot', 'retard', 'retarded', 'kys',
  'kill yourself', 'kms', 'kill myself', 'suicide', 'suicidal', 'hate you',
  'racist', 'sexist', 'transphobe', 'homophobe', 'pedophile', 'child abuse',
  'rape', 'sexual assault', 'harassment', 'doxx', 'doxing', 'threat', 'violence'
];

export function containsAbuseContent(text: string): boolean {
  const normalizedText = text.toLowerCase();

  return ABUSIVE_WORDS.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    return regex.test(normalizedText);
  });
}

export function validatePostContent(nickname: string, content: string): { valid: boolean; message?: string } {
  if (containsAbuseContent(nickname)) {
    return {
      valid: false,
      message: 'Your nickname contains inappropriate content. Please choose a different nickname.'
    };
  }

  if (containsAbuseContent(content)) {
    return {
      valid: false,
      message: 'Your message contains inappropriate content. Please revise and try again.'
    };
  }

  return { valid: true };
}
