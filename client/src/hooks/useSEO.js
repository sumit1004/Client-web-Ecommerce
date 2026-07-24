import { useEffect } from 'react';

export function useSEO({ title, description, image, url, type = 'website' }) {
  useEffect(() => {
    // Standard Title
    if (title) {
      document.title = title;
      setMetaTag('property', 'og:title', title);
      setMetaTag('name', 'twitter:title', title);
    }
    
    // Description
    if (description) {
      setMetaTag('name', 'description', description);
      setMetaTag('property', 'og:description', description);
      setMetaTag('name', 'twitter:description', description);
    }
    
    // Image
    if (image) {
      setMetaTag('property', 'og:image', image);
      setMetaTag('name', 'twitter:image', image);
      setMetaTag('name', 'twitter:card', 'summary_large_image');
    }
    
    // URL
    if (url) {
      setMetaTag('property', 'og:url', url);
    }
    
    // Type
    if (type) {
      setMetaTag('property', 'og:type', type);
    }
    
    return () => {
      // Optional: Cleanup could be done here, but typically we let the next page overwrite
    };
  }, [title, description, image, url, type]);
}

function setMetaTag(attrName, attrValue, content) {
  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}
