import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_NAME = "SlotEngine";
const SITE_URL = "https://lastmincancelledbookings.lovable.app";
const DEFAULT_DESCRIPTION = "Grab last-minute cancelled bookings at luxury venues, top restaurants, premium spas and more — at up to 50% off.";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
}

const SEOHead = ({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  type = "website",
  noIndex = false,
}: SEOHeadProps) => {
  const location = useLocation();
  const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Last-Minute Luxury Deals`;
  const fullUrl = `${SITE_URL}${location.pathname}`;

  useEffect(() => {
    document.title = fullTitle;

    const updateMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    updateMeta("name", "description", description);
    updateMeta("property", "og:title", fullTitle);
    updateMeta("property", "og:description", description);
    updateMeta("property", "og:url", fullUrl);
    updateMeta("property", "og:image", image);
    updateMeta("property", "og:type", type);
    updateMeta("name", "twitter:title", fullTitle);
    updateMeta("name", "twitter:description", description);
    updateMeta("name", "twitter:image", image);

    // Robots
    updateMeta("name", "robots", noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large");

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", fullUrl);
  }, [fullTitle, description, fullUrl, image, type, noIndex]);

  return null;
};

export default SEOHead;
