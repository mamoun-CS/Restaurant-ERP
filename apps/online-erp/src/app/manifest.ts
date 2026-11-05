import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "شيخ الكار Restaurant ERP",
    short_name: "شيخ الكار",
    description: "Professional restaurant operations and point of sale for Sheikh Al Kar.",
    start_url: "/login",
    display: "standalone",
    background_color: "#FFF7EF",
    theme_color: "#F86800",
    icons: [
      { src: "/brand/sheikh-al-kar-icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
