import { useEffect } from 'react';
import { business } from '../../constants/store.js';

export function Seo({ title, description }) {
  useEffect(() => {
    document.title = title ? `${title} | ${business.name}` : `${business.name} | Premium Fashion Since 1964`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && description) meta.setAttribute('content', description);
  }, [title, description]);
  return null;
}
