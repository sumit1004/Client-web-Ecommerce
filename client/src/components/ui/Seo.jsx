import { useEffect } from 'react';
import { business } from '../../constants/store.js';

export function Seo({ title, description, image, url, type = 'website' }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${business.name}` : `${business.name} | Premium Fashion Since 1964`;
    document.title = fullTitle;
    
    const setMeta = (attr, attrName, content) => {
      let meta = document.querySelector(`meta[${attr}="${attrName}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, attrName);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    if (description) {
      setMeta('name', 'description', description);
      setMeta('property', 'og:description', description);
      setMeta('name', 'twitter:description', description);
    }
    
    setMeta('property', 'og:title', fullTitle);
    setMeta('name', 'twitter:title', fullTitle);
    
    if (image) {
      setMeta('property', 'og:image', image);
      setMeta('name', 'twitter:image', image);
      setMeta('name', 'twitter:card', 'summary_large_image');
    }
    
    if (url) setMeta('property', 'og:url', url);
    if (type) setMeta('property', 'og:type', type);

  }, [title, description, image, url, type]);
  return null;
}
