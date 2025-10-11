import React from "react";

export function AppLogo({ className }: { className?: string }) {
  return (
    <img
      className={className}
      src="https://media.discordapp.net/attachments/1206671190605824121/1426643324814622852/icon.png?ex=68ebf8a2&is=68eaa722&hm=4fad0b06bd0d5822a7a5afc26df0e8339845d86fc6957e321070d8597068b299&=&format=webp&quality=lossless&width=64&height=64"
      alt="Civify Logo"
    />
  );
}
