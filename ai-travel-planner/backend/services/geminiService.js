const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

function isValidApiKey(key) {
  return Boolean(key && typeof key === 'string' && key.trim().length > 20 && !key.includes('your_key'));
}

function getModelList() {
  const preferred = process.env.GEMINI_MODEL;
  const models = preferred ? [preferred, ...FALLBACK_MODELS] : FALLBACK_MODELS;
  return [...new Set(models)];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractResponseText(result) {
  if (!result) return null;
  if (typeof result === 'string') return result;
  if (result.outputText) return result.outputText;
  if (result.candidates) {
    return result.candidates[0]?.content?.[0]?.text || null;
  }
  if (result.response?.text) {
    return typeof result.response.text === 'function' ? result.response.text() : result.response.text;
  }
  return null;
}

function parseJsonOrString(text) {
  if (!text || typeof text !== 'string') return null;
  try {
    return JSON.parse(text);
  } catch (err) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (error) {
        return null;
      }
    }
    return null;
  }
}

function isRetryableError(error) {
  const message = error?.message || '';
  return [ '429', '503', '500', 'CACHE_EXCEEDED', 'RESOURCE_EXHAUSTED', 'overloaded', 'timeout' ]
    .some((token) => message.includes(token));
}

async function callGeminiJson(prompt, fallbackFn) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!isValidApiKey(apiKey)) {
    console.warn('GEMINI_API_KEY is missing or invalid. Using fallback trip data.');
    console.warn('Get a free key at: https://aistudio.google.com/apikey');
    if (fallbackFn) return fallbackFn();
    throw new Error('Invalid Gemini API key');
  }

  const fetchFn = global.fetch || require('node-fetch');
  const models = getModelList();

  for (const modelName of models) {
    let delay = 1000;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const response = await fetchFn(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ mimeType: 'text/plain', text: prompt }],
            responseMimeType: 'application/json',
          }),
        });

        if (!response.ok) {
          const bodyText = await response.text();
          throw new Error(`Gemini HTTP ${response.status}: ${bodyText}`);
        }

        const result = await response.json();
        const rawText = await extractResponseText(result);
        const parsed = parseJsonOrString(rawText);
        if (!parsed) {
          throw new Error('Could not parse Gemini JSON response');
        }

        console.log(`Gemini success via model: ${modelName}`);
        return parsed;
      } catch (error) {
        console.warn(`Gemini ${modelName} attempt ${attempt + 1} failed: ${error.message}`);
        if (isRetryableError(error) && attempt < 4) {
          console.log(`Retrying in ${delay}ms...`);
          await sleep(delay);
          delay *= 2;
          continue;
        }
        break;
      }
    }
  }

  console.warn('All Gemini models failed. Using fallback data.');
  if (fallbackFn) return fallbackFn();
  throw new Error('Gemini API unavailable');
}

module.exports = { callGeminiJson, isValidApiKey };
