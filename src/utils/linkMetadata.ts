import axios from 'axios';

export interface LinkMetadata {
  title: string;
  summary: string;
  image: string;
}

/**
 * Fetches metadata (title, description, image) from any URL
 * by parsing Open Graph tags or meta tags from the HTML
 */
export const fetchLinkMetadata = async (url: string): Promise<LinkMetadata | null> => {
  try {
    // Fetch the HTML content
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 10000, // 10 second timeout
      maxRedirects: 5,
    });

    const html = response.data;

    if (!html || typeof html !== 'string') {
      return null;
    }

    // Extract metadata using regex patterns
    const extractMetaTag = (property: string, attribute: string = 'property'): string | null => {
      // Try Open Graph first (og:title, og:description, og:image)
      const ogPattern = new RegExp(
        `<meta[^>]*${attribute}=["']${property}["'][^>]*content=["']([^"']+)["']`,
        'i',
      );
      const ogMatch = html.match(ogPattern);
      if (ogMatch && ogMatch[1]) {
        return ogMatch[1].trim();
      }

      // Fallback to name attribute
      if (attribute === 'property') {
        return extractMetaTag(property, 'name');
      }

      return null;
    };

    // Extract title
    let title = extractMetaTag('og:title');
    if (!title) {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      title = titleMatch ? titleMatch[1].trim() : '';
    }

    // Extract description
    let summary = extractMetaTag('og:description');
    if (!summary) {
      summary = extractMetaTag('description', 'name') || '';
    }

    // Extract image
    let image = extractMetaTag('og:image');
    if (!image) {
      const imageMatch = html.match(
        /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
      );
      image = imageMatch ? imageMatch[1].trim() : '';
    }

    // Clean up extracted values
    title = title.replace(/\s+/g, ' ').trim();
    summary = summary.replace(/\s+/g, ' ').trim();
    image = image.trim();

    // Convert relative image URLs to absolute
    if (image && !image.startsWith('http')) {
      try {
        const urlObj = new URL(url);
        if (image.startsWith('//')) {
          image = `${urlObj.protocol}${image}`;
        } else if (image.startsWith('/')) {
          image = `${urlObj.protocol}//${urlObj.host}${image}`;
        } else {
          image = `${urlObj.protocol}//${urlObj.host}/${image}`;
        }
      } catch (e) {
        // Invalid URL, keep image as is
      }
    }

    // If we have at least a title, return the metadata
    if (title || summary || image) {
      return {
        title: title || '',
        summary: summary || '',
        image: image || '',
      };
    }

    return null;
  } catch (error) {
    console.log('Error fetching link metadata:', error);
    return null;
  }
};
