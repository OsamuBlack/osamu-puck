'use server';

/**
 * Regex to match Unsplash API URLs
 */
const UNSPLASH_URL_REGEX = /https:\/\/api\.unsplash\.com\/photos\/random\?([^"']+)/g;

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
 * Fetches images from Unsplash API and returns the actual image URLs
 * 
 * @param urls - Array of Unsplash API URLs to fetch
 * @returns Object mapping original URLs to actual image URLs
 */
async function fetchUnsplashImages(urls: string[]): Promise<Record<string, string>> {
  if (!urls.length) return {};

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.error("UNSPLASH_ACCESS_KEY is not defined in environment variables");
    return {};
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
          return [url, ""]; // Return empty string for failed requests
        }

        const data = await response.json();
        return [url, data.urls?.regular || data.urls?.small || ""];
      })
    );

    console.log(results)

    // Convert results array to object mapping original URL to actual image URL
    return Object.fromEntries(results);
  } catch (error) {
    console.error("Error fetching Unsplash images:", error);
    return {};
  }
}

/**
 * Processes a JSON string to replace Unsplash API URLs with actual image URLs
 * 
 * @param jsonString - The JSON string to process
 * @returns Promise resolving to the processed JSON string with actual image URLs
 */
export async function processUnsplashUrls(jsonString: string): Promise<string> {
  // Extract Unsplash URLs from the JSON
  const unsplashUrls = extractUnsplashUrls(jsonString);
  
  // If no Unsplash URLs found, return the original JSON
  if (!unsplashUrls.length) return jsonString;
  
  // Fetch actual image URLs for all Unsplash URLs
  const imageUrlMap = await fetchUnsplashImages(unsplashUrls);
  
  // Replace all occurrences of Unsplash API URLs with actual image URLs
  let processedJson = jsonString;
  Object.entries(imageUrlMap).forEach(([originalUrl, imageUrl]) => {
    if (imageUrl) {
      processedJson = processedJson.replace(
        new RegExp(originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        imageUrl
      );
    }
  });
  
  return processedJson;
}

/**
 * Client-side function to process Unsplash URLs in a JSON object
 * This is a wrapper around the server action that can be called from client components
 * 
 * @param jsonData - The data object containing potential Unsplash URLs
 * @returns The processed object with real image URLs
 */
export async function processUnsplashImages<T>(jsonData: T): Promise<T> {
  try {
    // Convert to string for processing
    const jsonString = JSON.stringify(jsonData);
    
    // Process all Unsplash URLs
    const processedJsonString = await processUnsplashUrls(jsonString);
    
    // Convert back to object
    return JSON.parse(processedJsonString);
  } catch (error) {
    console.error("Error processing Unsplash images:", error);
    return jsonData; // Return original on error
  }
}
