"use client";

import "./errors.css";

// Something broke while rendering a page. The same dead black player as the
// 404, with a button that re-fetches and re-renders the page.

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="gone">
      <div className="still-frame">
        {/* DRAFT */}
        <div className="gone-box">
          <h1>Something went wrong.</h1>
          <p>A small team of highly trained ushers has been sent to deal with it.</p>
          <button className="action" onClick={() => retry()}>
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
