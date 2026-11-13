"use client";

import dynamic from "next/dynamic";
import * as React from "react";
import type { CommandMenuDialogProps } from "./command-menu-dialog";

const CommandMenuDialog = dynamic(() =>
  import("./command-menu-dialog").then((mod) => mod.CommandMenuDialog)
);

type Props = Pick<CommandMenuDialogProps, "links" | "labels">;

export const CommandMenu = ({ links, labels }: Props) => {
  const [open, setOpen] = React.useState<boolean | null>(null);
  const [isMac, setIsMac] = React.useState(false);

  React.useEffect(() => {
    setIsMac(window.navigator.userAgent.includes("Mac"));

    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const shortcut = isMac ? "⌘" : "Ctrl";

  return (
    <>
      <p className="fixed bottom-0 left-0 right-0 hidden bg-gradient-to-t from-background to-transparent p-1 pt-6 text-center text-sm text-muted-foreground xl:block print:hidden">
        {labels.hintBefore}
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-foreground">
          <span className="text-xs">{shortcut}</span>+J
        </kbd>
        {labels.hintAfter}
      </p>
      {open !== null && (
        <CommandMenuDialog
          links={links}
          labels={labels}
          open={open}
          setOpen={setOpen}
        />
      )}
    </>
  );
};
