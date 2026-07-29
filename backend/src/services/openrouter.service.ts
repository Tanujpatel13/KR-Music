import dotenv from 'dotenv';
dotenv.config();

export interface AiChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiActionIntent {
  action: 'PLAY_SONG' | 'SEARCH_LYRICS' | 'ARTIST_TOP_SONGS' | 'CREATE_PLAYLIST' | 'RECOMMEND_SONGS' | 'CONTROL_PLAYBACK';
  query?: string;
  lyricsQuery?: string;
  artistName?: string;
  playlistName?: string;
  genreOrMood?: string;
  moodOrGenre?: string;
  command?: 'play' | 'pause' | 'next' | 'previous' | 'shuffle' | 'repeat' | 'mute';
}

export interface AiChatResponse {
  reply: string;
  action?: AiActionIntent | null;
  rawText: string;
}

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const MODEL_NAME = 'google/gemma-3-27b-it:free';

const SYSTEM_PROMPT: AiChatMessage = {
  role: 'system',
  content: `You are the intelligent AI Music Assistant for "KR Music", a premium Spotify-inspired music streaming platform.
Your role is to converse naturally about music, answer questions, provide recommendations, and control music playback for the user.

When responding to the user, ALWAYS provide a friendly, clear, natural language response.
If the user's prompt requests a specific music action (such as playing a song, searching by lyrics, playing an artist's top tracks, creating a playlist, recommending songs, or controlling playback), you MUST include a structured JSON action block at the very end of your response inside a \`\`\`json block.

Supported JSON action structures:

1. PLAY_SONG:
\`\`\`json
{
  "action": "PLAY_SONG",
  "query": "song name or query"
}
\`\`\`

2. SEARCH_LYRICS:
\`\`\`json
{
  "action": "SEARCH_LYRICS",
  "lyricsQuery": "line of lyrics or song text"
}
\`\`\`

3. ARTIST_TOP_SONGS:
\`\`\`json
{
  "action": "ARTIST_TOP_SONGS",
  "artistName": "artist name"
}
\`\`\`

4. CREATE_PLAYLIST:
\`\`\`json
{
  "action": "CREATE_PLAYLIST",
  "playlistName": "Playlist Name",
  "genreOrMood": "mood or genre descriptor"
}
\`\`\`

5. RECOMMEND_SONGS:
\`\`\`json
{
  "action": "RECOMMEND_SONGS",
  "moodOrGenre": "upbeat, chill, romance, telugu, hindi, workout, etc."
}
\`\`\`

6. CONTROL_PLAYBACK:
\`\`\`json
{
  "action": "CONTROL_PLAYBACK",
  "command": "play | pause | next | previous | shuffle | repeat | mute"
}
\`\`\`

Rules:
- Keep responses concise and engaging.
- If no action is needed (e.g., greetings or general trivia), omit the \`\`\`json block.
- Only output ONE \`\`\`json block per response if an action is recognized.`
};

export class OpenRouterService {
  private static getApiKey(): string {
    return process.env.OPENROUTER_API_KEY || '';
  }

  public static async generateChatResponse(userMessages: AiChatMessage[]): Promise<AiChatResponse> {
    const apiKey = this.getApiKey();

    const messages = [SYSTEM_PROMPT, ...userMessages];

    try {
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'KR Music'
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[OpenRouter] API request error (${response.status}): ${errorText}`);
        return this.getFallbackResponse(userMessages[userMessages.length - 1]?.content || '');
      }

      const data: any = await response.json();
      const content = data.choices?.[0]?.message?.content || "I'm ready to play music for you!";


      return this.parseAssistantResponse(content);
    } catch (err: any) {
      console.error('[OpenRouter] Network or server error:', err.message);
      return this.getFallbackResponse(userMessages[userMessages.length - 1]?.content || '');
    }
  }

  private static parseAssistantResponse(rawText: string): AiChatResponse {
    let reply = rawText;
    let action: AiActionIntent | null = null;

    // Extract json block from text
    const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        action = JSON.parse(jsonMatch[1].trim());
        // Clean reply text by stripping the JSON block for cleaner UI display
        reply = rawText.replace(/```json\s*[\s\S]*?\s*```/, '').trim();
      } catch (e) {
        console.warn('[OpenRouter] Failed to parse action JSON:', e);
      }
    }

    return {
      reply,
      action,
      rawText
    };
  }

  private static getFallbackResponse(userPrompt: string): AiChatResponse {
    const promptLower = userPrompt.toLowerCase();

    // Local pattern fallback engine when OpenRouter API Key is placeholder or offline
    if (promptLower.includes('play ') || promptLower.startsWith('play')) {
      const query = userPrompt.replace(/^play\s+/i, '').trim() || 'top tracks';
      return {
        reply: `🎵 Sure! Playing "${query}" for you right now on KR Music.`,
        action: { action: 'PLAY_SONG', query },
        rawText: `Playing ${query}`
      };
    }

    if (promptLower.includes('lyric') || promptLower.includes('lyrics')) {
      return {
        reply: `🎤 Searching lyrics matching "${userPrompt}"...`,
        action: { action: 'SEARCH_LYRICS', lyricsQuery: userPrompt },
        rawText: `Searching lyrics`
      };
    }

    if (promptLower.includes('top song') || promptLower.includes('artist')) {
      const artist = userPrompt.replace(/top songs of|by|artist/gi, '').trim() || 'Arijit Singh';
      return {
        reply: `🌟 Here are top tracks for ${artist}!`,
        action: { action: 'ARTIST_TOP_SONGS', artistName: artist },
        rawText: `Top songs`
      };
    }

    if (promptLower.includes('playlist') || promptLower.includes('create')) {
      return {
        reply: `🎧 Created custom playlist for you!`,
        action: { action: 'CREATE_PLAYLIST', playlistName: 'AI Selection', genreOrMood: userPrompt },
        rawText: `Playlist created`
      };
    }

    if (promptLower.includes('recommend') || promptLower.includes('suggest') || promptLower.includes('vibe') || promptLower.includes('mood')) {
      return {
        reply: `🔥 Here are recommended tracks for your vibe:`,
        action: { action: 'RECOMMEND_SONGS', moodOrGenre: userPrompt },
        rawText: `Recommended songs`
      };
    }

    if (promptLower.includes('pause') || promptLower.includes('next') || promptLower.includes('prev') || promptLower.includes('mute')) {
      let command: any = 'play';
      if (promptLower.includes('pause')) command = 'pause';
      if (promptLower.includes('next')) command = 'next';
      if (promptLower.includes('prev')) command = 'previous';
      if (promptLower.includes('mute')) command = 'mute';

      return {
        reply: `🎛️ Got it! Executing ${command} command.`,
        action: { action: 'CONTROL_PLAYBACK', command },
        rawText: `Playback control: ${command}`
      };
    }

    return {
      reply: `I am your KR Music AI Assistant powered by Gemma 3. You can ask me to play songs, search by lyrics, recommend tracks, or create playlists!`,
      action: null,
      rawText: `Default response`
    };
  }
}
