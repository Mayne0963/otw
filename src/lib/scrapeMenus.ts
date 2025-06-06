import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { menuItemSchema, MenuItem } from './firestoreModels';

const BROS_KIS_MENU_URL = 'https://www.broskiskitchen.com/menu';
const PARTNER_MENU_URL = 'https://www.broskiskitchen.com/partner-menu';

// Optionally enhance description with OpenAI - currently unused but kept for future implementation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function enhanceDescription(desc: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {return desc;}
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a creative menu copywriter.' },
          {
            role: 'user',
            content: `Rewrite this menu item description to be enticing and clear: ${desc}`,
          },
        ],
        max_tokens: 60,
      }),
    });
    if (!res.ok) {throw new Error(`OpenAI API error: ${res.statusText}`);}
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || desc;
  } catch (e) {
    console.error('Error enhancing description:', e);
    return desc;
  }
}

async function scrapeMenu(
  url: string,
  source: 'broskis' | 'partner',
): Promise<MenuItem[]> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OTW/1.0; +https://otw.com)',
      },
    });
    if (!res.ok) {throw new Error(`Failed to fetch menu: ${res.statusText}`);}
    const html = await res.text();
    const $ = cheerio.load(html);
    const items: MenuItem[] = [];

    // Example selectors - update as needed for real site structure
    $('.menu-item').each((_, el) => {
      try {
        const name = $(el).find('.menu-item-name').text().trim();
        const priceRaw = $(el)
          .find('.menu-item-price')
          .text()
          .replace(/[^\d.]/g, '');
        const price = parseFloat(priceRaw);
        const description = $(el).find('.menu-item-description').text().trim();
        const image = $(el).find('img').attr('src');
        const type = $(el).hasClass('infused') ? 'infused' : 'classic';

        if (!name || isNaN(price)) {return;}

        const item = {
          name,
          price,
          description: description || '',
          image: image || undefined,
          type: type as 'classic' | 'infused',
          source,
        };

        // Validate before adding
        menuItemSchema.parse(item);
        items.push(item);
      } catch (e) {
        console.error('Error processing menu item:', e);
      }
    });

    return items;
  } catch (e) {
    console.error(`Error scraping menu from ${url}:`, e);
    throw e;
  }
}

export async function fetchAndNormalizeMenus() {
  try {
    const [broskis, partner] = await Promise.all([
      scrapeMenu(BROS_KIS_MENU_URL, 'broskis'),
      scrapeMenu(PARTNER_MENU_URL, 'partner'),
    ]);
    return [...broskis, ...partner];
  } catch (err) {
    console.error('Menu scraping failed:', err);
    throw err;
  }
}
