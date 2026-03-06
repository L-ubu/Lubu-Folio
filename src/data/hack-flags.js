const FLAGS = [
  {
    id: 1,
    name: "source_code_sleuth",
    hint: "Developers leave notes in their HTML. Have you tried viewing page source?",
    location: "cross-site",
  },
  {
    id: 2,
    name: "console_cowboy",
    hint: "Open your browser's developer console. Some devs log secrets...",
    location: "cross-site",
  },
  {
    id: 3,
    name: "dotenv_detective",
    hint: "Environment files hold deployment secrets. Check the projects directory.",
    location: "filesystem",
  },
  {
    id: 4,
    name: "cipher_cracker",
    hint: "There's an encrypted file somewhere. The cipher is ancient — 13 steps ancient.",
    location: "minigame",
  },
  {
    id: 5,
    name: "port_5337",
    hint: "Network reconnaissance reveals open services. Try scanning for ports.",
    location: "minigame",
  },
  {
    id: 6,
    name: "base64_is_not_encryption",
    hint: "Some data in the filesystem looks encoded, not encrypted. Try decoding it.",
    location: "filesystem",
  },
  {
    id: 7,
    name: "history_repeats",
    hint: "Command history can reveal what previous users did. Check bash history.",
    location: "filesystem",
  },
  {
    id: 8,
    name: "hidden_in_plain_sight",
    hint: "Dotfiles are hidden by default. Try ls -a.",
    location: "filesystem",
  },
  {
    id: 9,
    name: "curl_the_api",
    hint: "The access log mentions an interesting API endpoint. Try requesting it.",
    location: "command",
  },
  {
    id: 10,
    name: "grep_master",
    hint: "Searching through files is a powerful skill. Try grepping for secrets.",
    location: "command",
  },
  {
    id: 11,
    name: "cookie_monster",
    hint: "Websites store data in cookies. Check your browser's cookie jar.",
    location: "cross-site",
  },
  {
    id: 12,
    name: "robots_welcome",
    hint: "Web crawlers follow rules. What file tells them where to go?",
    location: "cross-site",
  },
  {
    id: 13,
    name: "css_ninja",
    hint: "CSS custom properties can hide anything. Inspect the stylesheet.",
    location: "cross-site",
  },
  {
    id: 14,
    name: "four_oh_four",
    hint: "What happens when you visit a page that doesn't exist?",
    location: "cross-site",
  },
  {
    id: 15,
    name: "local_storage_lurker",
    hint: "Browsers have local storage. Check what this site is saving.",
    location: "cross-site",
  },
  {
    id: 16,
    name: "konami_legend",
    hint: "Up up down down left right left right B A. Classic.",
    location: "cross-site",
  },
  {
    id: 17,
    name: "inspect_element",
    hint: "Some elements carry hidden data attributes. Right-click and inspect.",
    location: "cross-site",
  },
  {
    id: 18,
    name: "crontab_snoop",
    hint: "Scheduled tasks can reveal maintenance routines. Check the crontab.",
    location: "filesystem",
  },
  {
    id: 19,
    name: "strings_attached",
    hint: "Binary files sometimes contain readable strings. Try the strings command.",
    location: "command",
  },
  {
    id: 20,
    name: "packet_sniffer",
    hint: "Network traffic tells stories. Try sniffing the wire.",
    location: "command",
  },
];

const SAVE_KEY = "hack-flags-found";

export function getFoundFlags() {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveFoundFlags(flags) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(flags));
}

export function validateFlag(input) {
  const cleaned = input.trim();
  const match = cleaned.match(/^FLAG\{(.+)\}$/i);
  if (!match) return { valid: false, error: "Invalid format." };

  const flagName = match[1].toLowerCase();
  const flag = FLAGS.find((f) => f.name === flagName);
  if (!flag) return { valid: false, error: "Unknown flag." };

  const found = getFoundFlags();
  if (found.includes(flag.id)) {
    return { valid: true, alreadyFound: true, flag };
  }

  return { valid: true, alreadyFound: false, flag };
}

export function markFlagFound(flagId) {
  const found = getFoundFlags();
  if (!found.includes(flagId)) {
    found.push(flagId);
    saveFoundFlags(found);
  }
  return found;
}

export function getNextHint(foundFlags) {
  const unfound = FLAGS.filter((f) => !foundFlags.includes(f.id));
  if (unfound.length === 0) return null;
  return unfound[Math.floor(Math.random() * unfound.length)];
}

export function getTotalFlags() {
  return FLAGS.length;
}

export function getAllFlags() {
  return FLAGS;
}
