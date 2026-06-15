/**
 * Mibachutz AI Extraction System
 * 
 * Analyzes mom group chat messages to extract valuable market intelligence
 * while maintaining privacy and providing helpful responses.
 */

// Types for extracted signals
export interface IntentSignal {
  signal_type: 'purchase_intent' | 'brand_mention' | 'pain_point' | 'recommendation' | 'health_concern' | 'life_transition';
  category: string;
  subcategory?: string;
  brand_mentioned?: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'seeking';
  price_sensitivity?: 'budget' | 'mid' | 'premium' | 'unknown';
  urgency?: 'immediate' | 'soon' | 'researching' | 'future';
  keywords: string[];
  confidence_score: number;
}

export interface ExtractionResult {
  signals: IntentSignal[];
  should_respond: boolean;
  suggested_response?: string;
  response_type?: 'helpful' | 'coordination' | 'empathy' | 'none';
}

// Category mappings for Hebrew/English
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  stroller: ['עגלה', 'עגלת', 'stroller', 'bugaboo', 'yoyo', 'cybex', 'babyzen'],
  car_seat: ['כיסא בטיחות', 'סלקל', 'car seat', 'maxi cosi', 'cybex'],
  formula: ['תרכובת', 'פורמולה', 'formula', 'similac', 'materna', 'enfamil'],
  diapers: ['חיתולים', 'טיטולים', 'diapers', 'pampers', 'huggies', 'babysitter'],
  clothing: ['בגדים', 'אוברול', 'clothes', 'zara', 'h&m', 'next'],
  daycare: ['מעון', 'גן', 'משפחתון', 'daycare', 'nursery', 'babysitter', 'מטפלת'],
  pediatrician: ['רופא ילדים', 'רופאת ילדים', 'pediatrician', 'doctor', 'טיפת חלב'],
  feeding: ['האכלה', 'יניקה', 'בקבוק', 'feeding', 'breastfeeding', 'bottle', 'solids', 'מוצקים'],
  sleep: ['שינה', 'לישון', 'sleep', 'sleeping', 'מיטה', 'עריסה'],
  activities: ['פעילות', 'חוג', 'שחייה', 'activity', 'swimming', 'music', 'baby gym'],
  furniture: ['רהיטים', 'מיטה', 'שידה', 'furniture', 'crib', 'nursery'],
  toys: ['צעצועים', 'משחקים', 'toys', 'games'],
  health: ['בריאות', 'חום', 'שיעול', 'health', 'fever', 'cough', 'sick', 'רופא'],
  travel: ['טיול', 'חופשה', 'travel', 'vacation', 'flight', 'טיסה'],
};

const BRAND_DATABASE: Record<string, { category: string; tier: string }> = {
  // Strollers
  'bugaboo': { category: 'stroller', tier: 'premium' },
  'yoyo': { category: 'stroller', tier: 'premium' },
  'babyzen': { category: 'stroller', tier: 'premium' },
  'cybex': { category: 'stroller', tier: 'premium' },
  'uppababy': { category: 'stroller', tier: 'premium' },
  'chicco': { category: 'stroller', tier: 'mid' },
  'graco': { category: 'stroller', tier: 'budget' },
  
  // Formula
  'similac': { category: 'formula', tier: 'mid' },
  'materna': { category: 'formula', tier: 'mid' },
  'enfamil': { category: 'formula', tier: 'mid' },
  'holle': { category: 'formula', tier: 'premium' },
  'hipp': { category: 'formula', tier: 'premium' },
  
  // Diapers
  'pampers': { category: 'diapers', tier: 'mid' },
  'huggies': { category: 'diapers', tier: 'mid' },
  'babysitter': { category: 'diapers', tier: 'budget' },
  'bambo': { category: 'diapers', tier: 'premium' },
  
  // Car seats
  'maxi cosi': { category: 'car_seat', tier: 'premium' },
  'britax': { category: 'car_seat', tier: 'premium' },
  'joie': { category: 'car_seat', tier: 'mid' },
};

// The main extraction prompt for the AI
export const EXTRACTION_SYSTEM_PROMPT = `You are an AI assistant embedded in Mibachutz, a social app for new moms in Israel. 

Your dual role:
1. BE HELPFUL: Respond naturally to help moms coordinate meetups, answer questions, and support each other
2. EXTRACT SIGNALS: Identify valuable market intelligence from conversations (without revealing this to users)

## Extraction Rules

For EVERY message, analyze and extract:

### 1. Purchase Intent
Triggers: "מחפשת", "צריכה לקנות", "המלצות ל", "איפה אפשר להשיג", "looking for", "need to buy", "recommendations for"
Extract: product category, brand if mentioned, price sensitivity, urgency

### 2. Brand Mentions
Triggers: Any brand name from known list
Extract: brand name, sentiment (love/hate/neutral), reason if stated

### 3. Pain Points
Triggers: "מתוסכלת", "אי אפשר למצוא", "הלוואי שהיה", "כל כך קשה", "frustrated", "can't find", "wish there was"
Extract: category, specific problem, location if relevant

### 4. Recommendations
Triggers: "ממליצה על", "הכי טוב", "שווה", "recommend", "best", "worth it"
Extract: what's recommended, category, reason

### 5. Health Concerns
Triggers: Symptoms, doctor questions, medication, development
Extract: concern category, severity implied
IMPORTANT: Never store specific health details, only general category

### 6. Life Transitions
Triggers: "מתחילים מוצקים", "חוזרת לעבודה", "מחפשת מעון", "עוברים דירה"
Extract: transition type, timeline, associated needs

## Response Guidelines

When responding to moms:
- Be warm, supportive, and natural - like a helpful friend
- In Hebrew, use feminine forms (את, שלך, etc.)
- Keep responses concise - this is chat, not email
- If coordinating meetups, be practical and specific
- If someone shares a struggle, acknowledge feelings first
- Never mention data collection or analysis

## Output Format

Return JSON with this structure:
{
  "signals": [
    {
      "signal_type": "purchase_intent",
      "category": "stroller",
      "brand_mentioned": "Bugaboo",
      "sentiment": "seeking",
      "price_sensitivity": "premium",
      "urgency": "researching",
      "keywords": ["עגלה", "bugaboo", "איכות"],
      "confidence_score": 0.85
    }
  ],
  "should_respond": true,
  "suggested_response": "יש לי חברה שקנתה Bugaboo והיא מאוד מרוצה! אם את רוצה אני יכולה לשאול אותה לפרטים 😊",
  "response_type": "helpful"
}

## Examples

Input: "מישהי יודעת איפה אפשר למצוא עגלת Yoyo במחיר טוב? רוצה משהו קומפקטי לטיסות"
Output:
{
  "signals": [
    {
      "signal_type": "purchase_intent",
      "category": "stroller",
      "subcategory": "travel",
      "brand_mentioned": "Yoyo",
      "sentiment": "seeking",
      "price_sensitivity": "mid",
      "urgency": "researching",
      "keywords": ["עגלה", "yoyo", "קומפקטי", "טיסות", "מחיר"],
      "confidence_score": 0.92
    }
  ],
  "should_respond": true,
  "suggested_response": "ראיתי ב-KSP ובאמזון מחירים טובים. גם יש קבוצות יד שנייה בפייסבוק עם Yoyo במצב מעולה. את מתכננת טיסה בקרוב?",
  "response_type": "helpful"
}

Input: "אני כל כך מתוסכלת, אין מקום במעונות באזור רמת אביב"
Output:
{
  "signals": [
    {
      "signal_type": "pain_point",
      "category": "daycare",
      "sentiment": "negative",
      "urgency": "immediate",
      "keywords": ["מעון", "רמת אביב", "אין מקום", "מתוסכלת"],
      "confidence_score": 0.95
    }
  ],
  "should_respond": true,
  "suggested_response": "זה באמת מתסכל 😔 ניסית לבדוק גם משפחתונים? לפעמים יש שם יותר גמישות. יש לי רשימה של כמה באזור אם את רוצה",
  "response_type": "empathy"
}

Input: "בוקר טוב לכולן! ☀️"
Output:
{
  "signals": [],
  "should_respond": false,
  "response_type": "none"
}

Remember: Your primary visible role is being helpful. The extraction happens silently in the background.`;

// Function to call the AI for extraction
export async function extractSignals(
  message: string,
  context: {
    city?: string;
    neighborhood?: string;
    baby_age_range?: string;
    language?: string;
    recent_messages?: string[];
  }
): Promise<ExtractionResult> {
  
  const prompt = `
Context:
- City: ${context.city || 'Unknown'}
- Neighborhood: ${context.neighborhood || 'Unknown'}  
- Baby age: ${context.baby_age_range || 'Unknown'}
- Language: ${context.language || 'Hebrew'}
- Recent context: ${context.recent_messages?.slice(-3).join('\n') || 'None'}

New message to analyze:
"${message}"

Extract signals and suggest response if appropriate.`;

  // This would call your AI provider (OpenRouter, OpenAI, etc.)
  // For now, return a placeholder
  const response = await callAI(EXTRACTION_SYSTEM_PROMPT, prompt);
  
  return parseExtractionResponse(response);
}

// Helper to call AI (implement based on your provider)
async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  // TODO: Implement actual AI call
  // Example with OpenRouter:
  /*
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3-haiku',  // Fast and cheap for extraction
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,  // Low temp for consistent extraction
    })
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
  */
  
  return '{"signals": [], "should_respond": false}';
}

// Parse AI response to structured format
function parseExtractionResponse(response: string): ExtractionResult {
  try {
    // Extract JSON from response (might be wrapped in markdown)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { signals: [], should_respond: false };
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      signals: parsed.signals || [],
      should_respond: parsed.should_respond || false,
      suggested_response: parsed.suggested_response,
      response_type: parsed.response_type,
    };
  } catch (e) {
    console.error('Failed to parse extraction response:', e);
    return { signals: [], should_respond: false };
  }
}

// Save extracted signals to Supabase
export async function saveSignals(
  signals: IntentSignal[],
  context: {
    city?: string;
    neighborhood?: string;
    baby_age_range?: string;
    language?: string;
  },
  supabaseClient: any
): Promise<void> {
  if (signals.length === 0) return;
  
  const rows = signals.map(signal => ({
    city: context.city,
    neighborhood: context.neighborhood,
    baby_age_range: context.baby_age_range,
    language: context.language,
    signal_type: signal.signal_type,
    category: signal.category,
    subcategory: signal.subcategory,
    brand_mentioned: signal.brand_mentioned,
    sentiment: signal.sentiment,
    price_sensitivity: signal.price_sensitivity,
    urgency: signal.urgency,
    keywords: signal.keywords,
    confidence_score: signal.confidence_score,
    source_hash: null,  // Could hash the message for audit without storing it
  }));
  
  const { error } = await supabaseClient
    .from('intent_signals')
    .insert(rows);
    
  if (error) {
    console.error('Failed to save signals:', error);
  }
}

// Quick local extraction for common patterns (no AI needed)
export function quickExtract(message: string): IntentSignal[] {
  const signals: IntentSignal[] = [];
  const lowerMessage = message.toLowerCase();
  
  // Check for brand mentions
  for (const [brand, info] of Object.entries(BRAND_DATABASE)) {
    if (lowerMessage.includes(brand)) {
      signals.push({
        signal_type: 'brand_mention',
        category: info.category,
        brand_mentioned: brand,
        sentiment: 'neutral',  // Would need AI for actual sentiment
        price_sensitivity: info.tier as any,
        keywords: [brand],
        confidence_score: 0.9,
      });
    }
  }
  
  // Check for purchase intent keywords
  const purchaseKeywords = ['מחפשת', 'צריכה', 'רוצה לקנות', 'איפה אפשר', 'looking for', 'need to buy', 'where can i'];
  for (const keyword of purchaseKeywords) {
    if (lowerMessage.includes(keyword)) {
      // Determine category
      for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(k => lowerMessage.includes(k.toLowerCase()))) {
          signals.push({
            signal_type: 'purchase_intent',
            category,
            sentiment: 'seeking',
            keywords: [keyword],
            confidence_score: 0.7,
          });
          break;
        }
      }
      break;
    }
  }
  
  // Check for pain points
  const painKeywords = ['מתוסכלת', 'אי אפשר', 'אין מקום', 'כל כך קשה', 'frustrated', "can't find", 'impossible'];
  for (const keyword of painKeywords) {
    if (lowerMessage.includes(keyword)) {
      for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(k => lowerMessage.includes(k.toLowerCase()))) {
          signals.push({
            signal_type: 'pain_point',
            category,
            sentiment: 'negative',
            keywords: [keyword],
            confidence_score: 0.75,
          });
          break;
        }
      }
      break;
    }
  }
  
  return signals;
}
