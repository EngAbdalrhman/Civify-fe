"use client";

import Script from "next/script";
import { useState } from "react";

const SUPADEMO_SCRIPT_URL = "https://script.supademo.com/supademo.js";

export function SupademoScript() {
  const [loaded, setLoaded] = useState(false);

  return (
    <Script
      id="supademo"
      src={SUPADEMO_SCRIPT_URL}
      strategy="lazyOnload"
      onLoad={() => setLoaded(true)}
      data-supademo-loaded={loaded ? "true" : "false"}
    />
  );
}
