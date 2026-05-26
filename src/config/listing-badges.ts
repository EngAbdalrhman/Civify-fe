export type ListingBadge = {
  id: string;
  name: string;
  listingUrl: string;
  imageUrl: string;
  imageAlt: string;
  imageWidth?: number;
  embedHtml: string;
  active: boolean;
};

export const LISTING_BADGES: ListingBadge[] = [
  {
    id: "kick-product",
    name: "Kick Product",
    listingUrl: "https://kickproduct.com/products/6a15848348ae32bd52832beb",
    imageUrl: "https://www.kickproduct.com/listedbadge.png",
    imageAlt: "Listed on Kick Product",
    imageWidth: 250,
    embedHtml: `<a href="https://kickproduct.com/products/6a15848348ae32bd52832beb" target="_blank" rel="noopener noreferrer"><img src="https://www.kickproduct.com/listedbadge.png" alt="Listed on Kick Product" width="250" /></a>`,
    active: true,
  },
  {
    id: "product-hunt",
    name: "Product Hunt",
    listingUrl:
      "https://www.producthunt.com/products/civify?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-civify",
    imageUrl:
      "https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1156159&theme=light&t=1779787164696",
    imageAlt:
      "Civify - Build professional, ATS-friendly CVs in seconds. | Product Hunt",
    imageWidth: 250,
    embedHtml: `<a href="https://www.producthunt.com/products/civify?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-civify" target="_blank" rel="noopener noreferrer"><img alt="Civify - Build professional, ATS-friendly CVs in seconds. | Product Hunt" width="250" height="54" src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1156159&theme=light&t=1779787164696"></a>`,
    active: true,
  },
];

export function getActiveListingBadges(): ListingBadge[] {
  return LISTING_BADGES.filter((badge) => badge.active);
}
