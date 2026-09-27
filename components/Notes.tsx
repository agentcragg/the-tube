"use client";

import { useState } from "react";

// Programme notes cut to a few lines with a "(more)" link, like old YouTube descriptions.
export default function Notes({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={open ? "notes-box notes-open" : "notes-box"}>
      <p>{text}</p>
      <button onClick={() => setOpen((o) => !o)}>{open ? "(less)" : "(more)"}</button>
    </div>
  );
}
