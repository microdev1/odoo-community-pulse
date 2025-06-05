"use client";

import { trpc } from "@/lib/trpc";

export default function ExampleTrpcComponent() {
  const hello = trpc.hello.useQuery({ text: "tRPC" });

  if (!hello.data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>tRPC Example</h1>
      <p>{hello.data.greeting}</p>
    </div>
  );
}
