import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ApiTemplateGeneratePdfOptions {
  templateId: string;
  data: Record<string, any>;
  exportType?: 'json' | 'file';
  apiKey?: string;
  region?: 'sg' | 'us' | 'de' | 'au';
}

interface ApiTemplatePdfResponse {
  status: 'success' | 'error';
  download_url?: string;
  template_id?: string;
  transaction_ref?: string;
  error?: string;
}

/**
 * Generates a PDF using APITemplate.io API or Supabase Edge Function proxy if no API key provided.
 */
export const generatePdf = async (options: ApiTemplateGeneratePdfOptions): Promise<ApiTemplatePdfResponse> => {
  const { 
    templateId, 
    data, 
    exportType = 'json',
    apiKey,
    region = 'us'
  } = options;
  
  // Define base URL based on region
  const baseUrls = {
    sg: 'https://rest.apitemplate.io',
    us: 'https://rest-us.apitemplate.io',
    de: 'https://rest-de.apitemplate.io',
    au: 'https://rest-au.apitemplate.io'
  };
  
  const apiUrl = `${baseUrls[region]}/v2/create-pdf`;
  
  try {
    // If no API key provided, call Supabase Edge Function as proxy
    if (!apiKey) {
      const { data: responseData, error } = await supabase.functions.invoke('generate-pdf-template', {
        body: { template_id: templateId, data, export_type: exportType }
      });
      
      if (error) {
        console.error('Error calling generate-pdf-template edge function:', error);
        throw new Error('Failed to generate PDF through edge function');
      }
      
      return responseData as ApiTemplatePdfResponse;
    }

    // Direct API call if API key is configured
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey
      },
      body: JSON.stringify({
        template_id: templateId,
        export_type: exportType,
        data
      })
    });

    if (!response.ok) {
      let errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        errorText = errorJson.message || errorText;
      } catch {
        // Keep original errorText if not JSON
      }
      throw new Error(`API error: ${errorText}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Failed to generate PDF');
    return {
      status: 'error',
      error: error.message
    };
  }
};

/**
 * Stub implementations for future PDF generation from HTML or URL, showing info toast and returning error.
 */
export const generatePdfFromHtml = async (htmlContent: string, cssContent: string, apiKey?: string) => {
  toast.info('PDF from HTML generation will be implemented soon');
  return {
    status: 'error',
    error: 'Not yet implemented'
  };
};

export const generatePdfFromUrl = async (url: string, apiKey?: string) => {
  toast.info('PDF from URL generation will be implemented soon');
  return {
    status: 'error',
    error: 'Not yet implemented'
  };
};
