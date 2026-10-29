import { setTimeout } from "node:timers/promises";
import { runtime } from "../runtime.js";
const { db, household } = await runtime();
let running = true;
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    running = false;
  });
while (running) {
  try {
    const work = await household.tick();
    if (!work) await setTimeout(1000);
  } catch {
    process.stderr.write(
      "Worker tick failed; durable state retained for recovery.\n",
    );
    await setTimeout(2000);
  }
}
await db.close();
