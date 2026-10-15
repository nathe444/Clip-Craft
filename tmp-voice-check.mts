import { calculateMp3Duration } from "./lib/ai/generate-voice";

const text =
  "Viktor Tsoi was born in 1874 in St. Petersburg. He died in 1908, at age thirty-four. His body was buried in a shallow grave near the city limits. In 1921, gravediggers opened the plot for a new tenant. They found his coffin empty. The lid was intact, but no bones, no clothes, no decay. Local police searched the region for three weeks. They found nothing. Tsoi's family received a formal report stating the absence of remains. No second funeral was ever held. The site remains unmarked today. Historians still debate if it was theft or a simple error in burial records.";

const res = await fetch("https://api.deepgram.com/v1/speak?model=aura-2-zeus-en", {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Token ${process.env.DEEPGRAM_API_KEY}` },
  body: JSON.stringify({ text }),
});
const buf = Buffer.from(await res.arrayBuffer());
const words = text.split(/\s+/).length;
console.log({
  status: res.status,
  type: res.headers.get("content-type"),
  bytes: buf.length,
  words,
  parsedSeconds: calculateMp3Duration(buf, words),
  firstBytes: buf.subarray(0, 4).toString("hex"),
  at48kbps: Number(((buf.length * 8) / 48000).toFixed(1)),
});
