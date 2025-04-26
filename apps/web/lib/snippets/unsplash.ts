'use server';

/**
 * Regex to match Unsplash API URLs
 */
const UNSPLASH_URL_REGEX = /https:\/\/api\.unsplash\.com\/photos\/random\?([^"']+)/g;

/**
 * Type for Unsplash image object
 */
export type UnsplashImage = {
  originalUrl: string;  // Original API URL
  imageUrl: string;     // Actual image URL
  description?: string; // Image description/alt text
  authorName?: string;  // Photographer name
  authorUrl?: string;   // Photographer profile URL
};

/**
 * Extracts all Unsplash API URLs from a JSON string
 * 
 * @param jsonString - The JSON string to search for Unsplash URLs
 * @returns Array of unique Unsplash URLs found in the JSON
 */
function extractUnsplashUrls(jsonString: string): string[] {
  const matches = jsonString.match(UNSPLASH_URL_REGEX) || [];
  return [...new Set(matches)]; // Return unique URLs
}

/**
 * Fetches images from Unsplash API and returns both image URLs and metadata
 * 
 * @param urls - Array of Unsplash API URLs to fetch
 * @returns Object with mapping and array of image objects
 */
async function fetchUnsplashImages(urls: string[]): Promise<{
  urlMap: Record<string, string>,
  images: UnsplashImage[]
}> {
  if (!urls.length) return { urlMap: {}, images: [] };

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.error("UNSPLASH_ACCESS_KEY is not defined in environment variables");
    return { urlMap: {}, images: [] };
  }

  try {
    const results = await Promise.all(
      urls.map(async (url) => {
        // Replace the client_id placeholder with the actual key
        const apiUrl = url.replace(/client_id=([^&]+)/, `client_id=${accessKey}`);
        
        const response = await fetch(apiUrl, {
          headers: {
            "Accept-Version": "v1",
          },
        });

        if (!response.ok) {
          console.error(`Unsplash API error (${response.status}): ${await response.text()}`);
          return [url, "", null]; // Return empty data for failed requests
        }

        const data = await response.json();
        const imageUrl = data.urls?.regular || data.urls?.small || "";
        
        // Create image object with metadata
        const imageObject: UnsplashImage = {
          originalUrl: url,
          imageUrl: imageUrl,
          description: data.description || data.alt_description,
          authorName: data.user?.name,
          authorUrl: data.user?.links?.html
        };
        
        return [url, imageUrl, imageObject]; 
      })
    );

    // Extract URL mapping and image objects from results
    const urlMap: Record<string, string> = {};
    const images: UnsplashImage[] = [];
    
    results.forEach(result => {
      const [originalUrl, imageUrl, imageObject] = result;
      urlMap[originalUrl] = imageUrl as string;
      if (imageObject) images.push(imageObject as UnsplashImage);
    });

    return { urlMap, images };
  } catch (error) {
    console.error("Error fetching Unsplash images:", error);
    return { urlMap: {}, images: [] };
  }
}

/**
 * Processes a JSON string to replace Unsplash API URLs with actual image URLs
 * 
 * @param jsonString - The JSON string to process
 * @returns Promise resolving to the processed JSON string with actual image URLs and image objects
 */
export async function processUnsplashUrls(jsonString: string): Promise<{
  processedJson: string,
  images: UnsplashImage[]
}> {
  // Extract Unsplash URLs from the JSON
  const unsplashUrls = extractUnsplashUrls(jsonString);
  
  // If no Unsplash URLs found, return the original JSON and empty images array
  if (!unsplashUrls.length) return { processedJson: jsonString, images: [] };
  
  // Fetch actual image URLs for all Unsplash URLs
  const { urlMap, images } = await fetchUnsplashImages(unsplashUrls);
  
  // Replace all occurrences of Unsplash API URLs with actual image URLs
  let processedJson = jsonString;
  Object.entries(urlMap).forEach(([originalUrl, imageUrl]) => {
    if (imageUrl) {
      processedJson = processedJson.replace(
        new RegExp(originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        imageUrl
      );
    }
  });
  
  return { processedJson, images };
}

/**
 * Client-side function to process Unsplash URLs in a JSON object
 * This is a wrapper around the server action that can be called from client components
 * 
 * @param jsonData - The data object containing potential Unsplash URLs
 * @returns The processed object with real image URLs and image objects
 */
export async function processUnsplashImages<T>(jsonData: T): Promise<{
  data: T,
  images: UnsplashImage[]
}> {
  try {
    // Convert to string for processing
    const jsonString = JSON.stringify(jsonData);
    
    // Process all Unsplash URLs
    const { processedJson, images } = await processUnsplashUrls(jsonString);
    
    // Convert back to object
    return {
      data: JSON.parse(processedJson) as T,
      images
    };
  } catch (error) {
    console.error("Error processing Unsplash images:", error);
    return { data: jsonData, images: [] }; // Return original on error
  }
}
