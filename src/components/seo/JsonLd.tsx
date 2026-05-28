import { serializeJsonLd } from "@/lib/seo/jsonLd";

interface JsonLdProps {
  data: unknown;
}

export function JsonLd({ data }: JsonLdProps) {
  if (Array.isArray(data)) {
    const payloads = data
      .map((item) => serializeJsonLd(item))
      .filter((payload): payload is string => Boolean(payload));
    if (payloads.length === 0) return null;

    return (
      <>
        {payloads.map((payload, index) => (
          <script
            key={`jsonld-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: payload }}
          />
        ))}
      </>
    );
  }

  const payload = serializeJsonLd(data);
  if (!payload) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: payload }}
    />
  );
}
