"use client";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Button
        onClick={() => console.log("Hello")}
      >
        Brewhub Button
      </Button>
    </div>
  );
}
