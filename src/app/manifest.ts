import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Civify",
    short_name: "Civify",
    description: "Civify - The Ultimate AI Tooling Platform",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/civify-logo-simple.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/civify-logo-simple.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
