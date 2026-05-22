import { Font } from "@react-pdf/renderer";

// DejaVu Sans covers Latin + Cyrillic (default PDF fonts do not).
// Registered once; importing modules just reference this side effect.
Font.register({
  family: "DejaVu",
  fonts: [
    { src: "/fonts/DejaVuSans.ttf" },
    { src: "/fonts/DejaVuSans-Bold.ttf", fontWeight: "bold" },
  ],
});
Font.registerHyphenationCallback((word) => [word]);
