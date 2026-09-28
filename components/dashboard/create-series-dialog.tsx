"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type ClipSeries, readSeries, saveSeries } from "./series-store";

export function CreateSeriesDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");

  function createSeries() {
    const title = name.trim();
    if (!title) return;

    const next: ClipSeries[] = [
      { id: crypto.randomUUID(), name: title, createdAt: Date.now() },
      ...readSeries(),
    ];
    saveSeries(next);
    setName("");
    onOpenChange(false);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            createSeries();
          }}
        >
          <DialogHeader>
            <DialogTitle>Create new series</DialogTitle>
            <DialogDescription>
              A series is a set of short videos you generate and schedule together.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 grid gap-2">
            <Label htmlFor="series-name">Series name</Label>
            <Input
              id="series-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Spring product launch"
              autoFocus
            />
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Create series
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
