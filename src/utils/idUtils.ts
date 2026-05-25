
import { v4 as uuidv4 } from 'uuid';

/**
 * Recursively assigns unique IDs to all objects in the content
 * @param content Any content object or array that needs IDs
 * @returns The same content structure with IDs assigned
 */
export const assignIds = (content: any) => {
  // Recursively assign IDs to all objects in the content
  if (!content) return content;
  
  // For arrays, process each item
  if (Array.isArray(content)) {
    return content.map(item => assignIds(item));
  }
  
  // For objects, add ID if needed and process properties
  if (typeof content === 'object') {
    const result = { ...content };
    
    // Add ID if not present
    if (!result.id) {
      result.id = uuidv4();
    }
    
    // Process all properties recursively
    Object.keys(result).forEach(key => {
      if (typeof result[key] === 'object' && result[key] !== null) {
        result[key] = assignIds(result[key]);
      }
    });
    
    return result;
  }
  
  return content;
};
