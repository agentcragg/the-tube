/* eslint-disable @next/next/no-img-element -- art-directed <picture> and plain stills */
import { getImageProps } from "next/image";
import type { Film } from "@/lib/films";
import { HANDBILL_SIZE, type Handbill } from "@/lib/fun/handbill";

// The banner's art. When the week's handbill exists: a <picture> with the wide
// file and, on phones, the tall crop (Next's "Art direction" pattern). When it
// doesn't: the film's stills printed in one ink over a pale wash of its colour.

// GIFs skip the optimiser so they keep moving. Animated WebP passes through on its own.
const passThrough = (src: string) => /\.gif$/i.test(src);

export default function HandbillArt({
  film,
  bill,
  eager,
  sizes,
}: {
  film: Film;
  bill: Handbill;
  eager: boolean;
  sizes: string;
}) {
  const loading = eager ? "eager" : "lazy";

  if (bill.wide) {
    const alt = `Handbill for ${film.title}${bill.by ? `, by ${bill.by}` : ""}`;
    const { props: wide } = getImageProps({
      alt,
      sizes,
      loading,
      src: bill.wide,
      ...HANDBILL_SIZE.wide,
      unoptimized: passThrough(bill.wide),
    });
    let tall: string | undefined;
    if (bill.tall) {
      const { props } = getImageProps({
        alt,
        sizes: "100vw",
        src: bill.tall,
        ...HANDBILL_SIZE.tall,
        unoptimized: passThrough(bill.tall),
      });
      tall = props.srcSet ?? props.src;
    }
    return (
      <picture className={tall ? "handbill-pic has-tall" : "handbill-pic"}>
        {tall && <source media="(max-width: 720px)" srcSet={tall} sizes="100vw" />}
        <img {...wide} alt={alt} />
      </picture>
    );
  }

  const stills = film.stills.slice(0, 4);
  return (
    <div className="handbill-collage" data-n={stills.length}>
      {stills.map((src) => (
        <img key={src} src={src} alt="" loading="lazy" decoding="async" />
      ))}
    </div>
  );
}
