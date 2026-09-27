// A festival laurel in thin white line art: two leafy branches around three
// short lines of caps. Drawn in an 80×48 box; the right branch is the left one
// mirrored. Generated once (an ellipse for the stem, almond leaves in pairs
// along it) and pasted in, so there's nothing to compute at runtime.

const BRANCH =
  "M34.1 44.1A28.5 20 0 0 1 24.9 7.5" +
  // outer leaves, bottom to top
  "M30.3 43.3Q26 43.2 23.6 46.8Q27.9 46.9 30.3 43.3M23.2 40.7Q19.1 39.6 16 42.6Q20.2 43.7 23.2 40.7" +
  "M17.5 36.8Q13.8 34.7 10 36.8Q13.8 38.9 17.5 36.8M13.6 32Q10.7 28.8 6.4 29.7Q9.4 32.8 13.6 32" +
  "M11.7 26.6Q10.1 22.6 5.9 21.8Q7.4 25.8 11.7 26.6M11.9 21Q12 16.7 8.4 14.4Q8.3 18.7 11.9 21" +
  "M14.4 15.7Q16 11.7 13.4 8.3Q11.8 12.3 14.4 15.7M18.8 11.1Q21.5 7.8 20.1 3.7Q17.4 7.1 18.8 11.1" +
  // inner leaves, smaller, so they stay clear of the words
  "M26.6 42.2Q26.1 39 23 38.4Q23.5 41.5 26.6 42.2M20.2 38.9Q20.4 35.7 17.6 34.3Q17.3 37.5 20.2 38.9" +
  "M15.3 34.5Q16.4 31.5 14.1 29.4Q13 32.4 15.3 34.5M12.3 29.3Q14.4 26.9 12.9 24.1Q10.9 26.5 12.3 29.3" +
  "M11.5 23.8Q14.3 22.4 14.1 19.2Q11.2 20.6 11.5 23.8M12.9 18.3Q16.1 18 17 15Q13.8 15.3 12.9 18.3" +
  "M16.4 13.3Q19.5 14.1 21.3 11.5Q18.2 10.7 16.4 13.3M21.7 9.2Q24.4 10.8 26.9 8.8Q24.2 7.2 21.7 9.2" +
  // the leaf at the tip
  "M24.9 7.5Q29 7.5 31 3.8Q26.8 3.9 24.9 7.5";

export default function LaurelMark({
  lines,
  label,
  ref,
}: {
  lines: [string, string, string];
  label: string;
  ref?: React.Ref<SVGSVGElement>;
}) {
  const [top, middle, bottom] = lines;
  return (
    <svg ref={ref} className="laurel" viewBox="0 0 80 48" role="img" aria-label={label}>
      <g fill="none" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d={BRANCH} />
        <path d={BRANCH} transform="matrix(-1 0 0 1 80 0)" />
      </g>
      {/* The classes let the small laurel on phones drop the middle line
          (app/laurels.css) */}
      <g fill="#fff" fontFamily="Arial, Helvetica, sans-serif" fontWeight="bold" textAnchor="middle">
        <text className="laurel-top" x="40" y="19.6" fontSize="7.6">
          {top}
        </text>
        <text className="laurel-place" x="40" y="27.4" fontSize="6" letterSpacing="0.4">
          {middle}
        </text>
        <text className="laurel-year" x="40" y="35.2" fontSize="6.4">
          {bottom}
        </text>
      </g>
    </svg>
  );
}
