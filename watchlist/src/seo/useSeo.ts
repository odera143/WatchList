import { useEffect } from 'react';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_IMAGE_PATH,
  DEFAULT_TITLE,
  SITE_NAME,
  toAbsoluteUrl,
} from './site';

type JsonLd = Record<string, unknown> | Array<Record<string, unknown>>;

type SeoConfig = {
  title?: string;
  description?: string;
  path?: string;
  robots?: string;
  image?: string;
  type?: string;
  jsonLd?: JsonLd;
};

const ensureMetaTag = (attribute: 'name' | 'property', value: string) => {
  let element = document.head.querySelector(
    `meta[${attribute}="${value}"]`,
  ) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }

  return element;
};

const ensureCanonicalLink = () => {
  let element = document.head.querySelector(
    'link[rel="canonical"]',
  ) as HTMLLinkElement | null;

  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }

  return element;
};

const ensureJsonLdScript = () => {
  let element = document.head.querySelector(
    'script[data-seo-json-ld="true"]',
  ) as HTMLScriptElement | null;

  if (!element) {
    element = document.createElement('script');
    element.type = 'application/ld+json';
    element.dataset.seoJsonLd = 'true';
    document.head.appendChild(element);
  }

  return element;
};

export const useSeo = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path,
  robots = 'index, follow',
  image = DEFAULT_IMAGE_PATH,
  type = 'website',
  jsonLd,
}: SeoConfig) => {
  useEffect(() => {
    const canonicalUrl = toAbsoluteUrl(
      path ?? `${window.location.pathname}${window.location.search}`,
    );
    const imageUrl = toAbsoluteUrl(image);

    document.title = title;
    ensureCanonicalLink().href = canonicalUrl;

    ensureMetaTag('name', 'description').content = description;
    ensureMetaTag('name', 'robots').content = robots;
    ensureMetaTag('property', 'og:site_name').content = SITE_NAME;
    ensureMetaTag('property', 'og:type').content = type;
    ensureMetaTag('property', 'og:title').content = title;
    ensureMetaTag('property', 'og:description').content = description;
    ensureMetaTag('property', 'og:url').content = canonicalUrl;
    ensureMetaTag('property', 'og:image').content = imageUrl;
    ensureMetaTag('name', 'twitter:card').content = 'summary_large_image';
    ensureMetaTag('name', 'twitter:title').content = title;
    ensureMetaTag('name', 'twitter:description').content = description;
    ensureMetaTag('name', 'twitter:image').content = imageUrl;

    const existingJsonLd = document.head.querySelector(
      'script[data-seo-json-ld="true"]',
    ) as HTMLScriptElement | null;

    if (!jsonLd) {
      existingJsonLd?.remove();
      return;
    }

    ensureJsonLdScript().textContent = JSON.stringify(jsonLd);
  }, [description, image, jsonLd, path, robots, title, type]);
};
