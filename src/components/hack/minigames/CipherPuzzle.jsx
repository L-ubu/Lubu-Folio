function rot13(str) {
  return str.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= "Z" ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

export async function runDecrypt(input, addLine) {
  if (!input) {
    addLine("");
    addLine({ text: "Usage: decrypt <encrypted text>", type: "warning" });
    return null;
  }

  addLine("");
  addLine({ text: `Input:  ${input}`, type: "dim" });

  await sleep(200);
  addLine({ text: "Trying ROT-13...", type: "dim" });
  await sleep(400);

  const result = rot13(input);
  addLine({
    text: `Result: ${result}`,
    type: result.includes("FLAG{") ? "success" : "text",
  });
  addLine("");

  const flagMatch = result.match(/FLAG\{[^}]+\}/i);
  return flagMatch ? flagMatch[0] : null;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
