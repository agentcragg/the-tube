import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The Trecartin night became a double bill and changed address
      {
        source: "/films/a-family-finds-entertainment",
        destination: "/films/ryan-trecartin-double-bill",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
