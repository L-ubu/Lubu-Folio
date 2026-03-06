import { useState, useCallback, useEffect, useRef } from "react";
import Terminal, { COLORS } from "./Terminal";
import BootSequence from "./BootSequence";
import {
  resolvePath,
  getNode,
  listDir,
  readFile,
  getCompletions,
  grepFiles,
  HOME,
} from "../../data/hack-filesystem";
import {
  validateFlag,
  markFlagFound,
  getFoundFlags,
  getNextHint,
  getTotalFlags,
  getAllFlags,
} from "../../data/hack-flags";
import { runPortScan } from "./minigames/PortScanner";
import { runDecrypt } from "./minigames/CipherPuzzle";
import { registerCommands, unregisterCommands } from "../shared/DevConsole";
import { useAchievementStore } from "../achievements/store";

const ASCII_BANNER = `
   ██╗     ██╗   ██╗ ██████╗ █████╗     ███████╗███████╗██╗  ██╗
   ██║     ██║   ██║██╔════╝██╔══██╗    ██╔════╝██╔════╝██║  ██║
   ██║     ██║   ██║██║     ███████║    ███████╗███████╗███████║
   ██║     ██║   ██║██║     ██╔══██║    ╚════██║╚════██║██╔══██║
   ███████╗╚██████╔╝╚██████╗██║  ██║    ███████║███████║██║  ██║
   ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝    ╚══════╝╚══════╝╚═╝  ╚═╝`;

export default function HackApp() {
  const [booted, setBooted] = useState(false);
  const [lines, setLines] = useState([]);
  const [cwd, setCwd] = useState(HOME);
  const [scanning, setScanning] = useState(false);
  const cwdRef = useRef(HOME);
  const unlock = useAchievementStore((s) => s.unlock);

  useEffect(() => {
    cwdRef.current = cwd;
  }, [cwd]);
  useEffect(() => {
    unlock("ssh-connect");
  }, [unlock]);

  const addLine = useCallback((line) => {
    if (typeof line === "object" && line.replace) {
      setLines((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { text: line.text, type: line.type };
        return copy;
      });
    } else {
      setLines((prev) => [...prev, line]);
    }
  }, []);

  const handleFlagSubmit = useCallback(
    (input) => {
      const result = validateFlag(input);
      if (!result.valid) {
        addLine({ text: result.error, type: "error" });
        return;
      }
      if (result.alreadyFound) {
        addLine({
          text: `Already captured. (${result.flag.name})`,
          type: "warning",
        });
        return;
      }

      const found = markFlagFound(result.flag.id);
      addLine("");
      addLine({
        text: `  ◆ FLAG #${String(result.flag.id).padStart(2, "0")} CAPTURED`,
        type: "success",
      });
      addLine({ text: `  ${found.length}/${getTotalFlags()}`, type: "accent" });
      addLine("");

      unlock("first-flag");
      if (found.length >= getTotalFlags()) {
        unlock("all-flags");
        addLine({ text: "  ★ ALL FLAGS CAPTURED ★", type: "warning" });
        addLine("");
      }
    },
    [addLine, unlock],
  );

  const handleComplete = useCallback((input) => {
    const parts = input.split(/\s+/);
    if (parts.length < 2) return [];
    const lastWord = parts[parts.length - 1];
    return getCompletions(cwdRef.current, lastWord);
  }, []);

  const handleCommand = useCallback(
    async (raw) => {
      addLine({ text: raw, type: "cmd" });

      const parts = raw.trim().split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);
      const arg = args.join(" ");

      switch (cmd) {
        case "help": {
          addLine("");
          addLine({ text: "  Navigation", type: "accent" });
          addLine({
            text: "    ls [-a] [path]       list directory",
            type: "text",
          });
          addLine({
            text: "    cd <dir>             change directory",
            type: "text",
          });
          addLine({
            text: "    pwd                  print working directory",
            type: "text",
          });
          addLine({ text: "    cat <file>           read file", type: "text" });
          addLine({
            text: "    head/tail <file>     first/last lines",
            type: "text",
          });
          addLine({ text: "", type: "text" });
          addLine({ text: "  Search & Analysis", type: "accent" });
          addLine({
            text: "    grep <pattern> [dir] search files for text",
            type: "text",
          });
          addLine({
            text: "    find <name>          find files by name",
            type: "text",
          });
          addLine({
            text: "    strings <file>       extract readable strings",
            type: "text",
          });
          addLine({
            text: "    base64 <text>        decode base64",
            type: "text",
          });
          addLine({
            text: "    file <path>          identify file type",
            type: "text",
          });
          addLine({
            text: "    wc <file>            count lines/words",
            type: "text",
          });
          addLine({ text: "", type: "text" });
          addLine({ text: "  Network", type: "accent" });
          addLine({
            text: "    nmap                 scan for open ports",
            type: "text",
          });
          addLine({
            text: "    curl <url>           make HTTP request",
            type: "text",
          });
          addLine({
            text: "    tcpdump <file>       read packet capture",
            type: "text",
          });
          addLine({
            text: "    ping <host>          ping a host",
            type: "text",
          });
          addLine({ text: "", type: "text" });
          addLine({ text: "  Crypto", type: "accent" });
          addLine({
            text: "    decrypt <text>       decrypt cipher text",
            type: "text",
          });
          addLine({ text: "", type: "text" });
          addLine({ text: "  CTF", type: "accent" });
          addLine({
            text: "    submit <flag>        submit a flag",
            type: "text",
          });
          addLine({
            text: "    flags                show progress",
            type: "text",
          });
          addLine({
            text: "    hint                 get a random hint",
            type: "text",
          });
          addLine({ text: "", type: "text" });
          addLine({ text: "  System", type: "accent" });
          addLine({
            text: "    whoami               current user",
            type: "text",
          });
          addLine({
            text: "    id                   user/group info",
            type: "text",
          });
          addLine({
            text: "    hostname             system hostname",
            type: "text",
          });
          addLine({
            text: "    uptime               system uptime",
            type: "text",
          });
          addLine({
            text: "    env                  environment vars",
            type: "text",
          });
          addLine({
            text: "    history              command history",
            type: "text",
          });
          addLine({
            text: "    date                 current date",
            type: "text",
          });
          addLine({
            text: "    uname                system info",
            type: "text",
          });
          addLine({
            text: "    clear                clear terminal",
            type: "text",
          });
          addLine({
            text: "    exit                 return to hub",
            type: "text",
          });
          addLine("");
          addLine({
            text: "  Tab to autocomplete. ↑↓ for history.",
            type: "dim",
          });
          addLine("");
          break;
        }

        case "ls":
        case "dir": {
          const showHidden =
            args.includes("-a") || args.includes("-la") || args.includes("-al");
          const pathArg = args.find((a) => !a.startsWith("-")) || "";
          const target = pathArg
            ? resolvePath(cwdRef.current, pathArg)
            : cwdRef.current;
          const entries = listDir(target, showHidden);
          if (!entries) {
            addLine({
              text: `ls: cannot access '${pathArg || cwdRef.current}': No such directory`,
              type: "error",
            });
            break;
          }
          addLine("");
          for (const e of entries) {
            const color = e.isDir
              ? "accent"
              : e.name.startsWith(".")
                ? "dim"
                : "text";
            const suffix = e.isDir ? "/" : "";
            addLine({ text: `  ${e.name}${suffix}`, type: color });
          }
          addLine("");
          break;
        }

        case "cd": {
          if (!arg || arg === "~") {
            setCwd(HOME);
            break;
          }
          const target = resolvePath(cwdRef.current, arg);
          const node = getNode(target);
          if (!node)
            addLine({ text: `cd: no such directory: ${arg}`, type: "error" });
          else if (node.type !== "dir")
            addLine({ text: `cd: not a directory: ${arg}`, type: "error" });
          else setCwd(target);
          break;
        }

        case "cat": {
          if (!arg) {
            addLine({ text: "cat: missing operand", type: "error" });
            break;
          }
          const target = resolvePath(cwdRef.current, arg);
          const node = getNode(target);
          if (!node) {
            addLine({ text: `cat: ${arg}: No such file`, type: "error" });
            break;
          }
          if (node.type === "dir") {
            addLine({ text: `cat: ${arg}: Is a directory`, type: "error" });
            break;
          }
          if (node.binary) {
            addLine({
              text: `cat: ${arg}: Binary file (use 'strings' or 'file')`,
              type: "warning",
            });
            break;
          }
          addLine("");
          for (const line of node.content) {
            addLine({
              text: line,
              type: line.includes("FLAG{") ? "success" : "text",
            });
          }
          addLine("");
          break;
        }

        case "head": {
          if (!arg) {
            addLine({ text: "head: missing operand", type: "error" });
            break;
          }
          const content = readFile(resolvePath(cwdRef.current, arg));
          if (!content) {
            addLine({ text: `head: ${arg}: No such file`, type: "error" });
            break;
          }
          addLine("");
          for (const line of content.slice(0, 5))
            addLine({ text: line, type: "text" });
          addLine("");
          break;
        }

        case "tail": {
          if (!arg) {
            addLine({ text: "tail: missing operand", type: "error" });
            break;
          }
          const content = readFile(resolvePath(cwdRef.current, arg));
          if (!content) {
            addLine({ text: `tail: ${arg}: No such file`, type: "error" });
            break;
          }
          addLine("");
          for (const line of content.slice(-5))
            addLine({ text: line, type: "text" });
          addLine("");
          break;
        }

        case "wc": {
          if (!arg) {
            addLine({ text: "wc: missing operand", type: "error" });
            break;
          }
          const content = readFile(resolvePath(cwdRef.current, arg));
          if (!content) {
            addLine({ text: `wc: ${arg}: No such file`, type: "error" });
            break;
          }
          const words = content.join(" ").split(/\s+/).filter(Boolean).length;
          addLine({
            text: `  ${content.length} lines, ${words} words`,
            type: "text",
          });
          break;
        }

        case "file": {
          if (!arg) {
            addLine({ text: "file: missing operand", type: "error" });
            break;
          }
          const target = resolvePath(cwdRef.current, arg);
          const node = getNode(target);
          if (!node) {
            addLine({ text: `file: ${arg}: No such file`, type: "error" });
            break;
          }
          if (node.type === "dir")
            addLine({ text: `${arg}: directory`, type: "text" });
          else if (node.binary)
            addLine({ text: `${arg}: ${node.content[0]}`, type: "text" });
          else if (arg.endsWith(".md"))
            addLine({
              text: `${arg}: Markdown document, UTF-8 text`,
              type: "text",
            });
          else if (arg.endsWith(".py"))
            addLine({
              text: `${arg}: Python script, UTF-8 text executable`,
              type: "text",
            });
          else if (arg.endsWith(".json"))
            addLine({ text: `${arg}: JSON data, UTF-8 text`, type: "text" });
          else addLine({ text: `${arg}: ASCII text`, type: "text" });
          break;
        }

        case "pwd":
          addLine({ text: cwdRef.current, type: "text" });
          break;

        case "whoami": {
          const found = getFoundFlags();
          let level = "guest";
          if (found.length >= getTotalFlags()) level = "root";
          else if (found.length >= 10) level = "admin";
          else if (found.length >= 5) level = "user";
          else if (found.length >= 1) level = "guest+";
          addLine({ text: level, type: "accent" });
          break;
        }

        case "id": {
          const found = getFoundFlags();
          const uid = found.length >= getTotalFlags() ? 0 : 1001;
          const user = uid === 0 ? "root" : "guest";
          addLine({
            text: `uid=${uid}(${user}) gid=${uid}(${user}) groups=${uid}(${user})`,
            type: "text",
          });
          break;
        }

        case "hostname":
          addLine({ text: "portfolio.dev", type: "text" });
          break;

        case "uptime": {
          const mins = Math.floor(
            (Date.now() - performance.timeOrigin) / 60000,
          );
          addLine({
            text: ` ${new Date().toLocaleTimeString()} up ${mins} min, 1 user, load: 0.42, 0.37, 0.21`,
            type: "text",
          });
          break;
        }

        case "env":
          addLine({ text: "USER=guest", type: "text" });
          addLine({ text: "HOME=/home/luca", type: "text" });
          addLine({ text: "SHELL=/bin/bash", type: "text" });
          addLine({ text: "PATH=/usr/local/bin:/usr/bin:/bin", type: "text" });
          addLine({ text: "TERM=xterm-256color", type: "text" });
          addLine({ text: "LANG=en_US.UTF-8", type: "text" });
          addLine({ text: "NODE_ENV=production", type: "text" });
          break;

        case "history": {
          const content = readFile("/home/luca/.bash_history");
          if (content) {
            addLine("");
            content.forEach((line, i) =>
              addLine({
                text: `  ${String(i + 1).padStart(4)}  ${line}`,
                type: "text",
              }),
            );
            addLine("");
          }
          break;
        }

        case "grep": {
          if (!args[0]) {
            addLine({
              text: "Usage: grep <pattern> [directory]",
              type: "error",
            });
            break;
          }
          const pattern = args[0];
          const searchPath = args[1]
            ? resolvePath(cwdRef.current, args[1])
            : cwdRef.current;
          const results = grepFiles(searchPath, pattern);
          if (results.length === 0) {
            addLine({ text: `(no matches for "${pattern}")`, type: "dim" });
          } else {
            addLine("");
            for (const r of results.slice(0, 30)) {
              const highlighted = r.text.replace(
                new RegExp(
                  `(${pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
                  "gi",
                ),
                "»$1«",
              );
              addLine({
                text: `  ${r.file}:${r.line}: ${highlighted}`,
                type: r.text.includes("FLAG{") ? "success" : "text",
              });
            }
            if (results.length > 30)
              addLine({
                text: `  ... and ${results.length - 30} more`,
                type: "dim",
              });
            addLine("");
          }
          break;
        }

        case "find": {
          if (!arg) {
            addLine({ text: "Usage: find <filename>", type: "error" });
            break;
          }
          const pattern = arg.toLowerCase();
          const results = grepFiles("/", "");
          const allPaths = new Set();
          function walkPaths(node, path) {
            if (node.type === "dir" && node.children) {
              for (const [name, child] of Object.entries(node.children)) {
                const full = path === "/" ? `/${name}` : `${path}/${name}`;
                if (name.toLowerCase().includes(pattern)) allPaths.add(full);
                walkPaths(child, full);
              }
            }
          }
          walkPaths(getNode("/"), "/");
          if (allPaths.size === 0) {
            addLine({ text: `(no files matching "${arg}")`, type: "dim" });
          } else {
            addLine("");
            for (const p of allPaths) addLine({ text: `  ${p}`, type: "text" });
            addLine("");
          }
          break;
        }

        case "strings": {
          if (!arg) {
            addLine({ text: "Usage: strings <file>", type: "error" });
            break;
          }
          const target = resolvePath(cwdRef.current, arg);
          const node = getNode(target);
          if (!node) {
            addLine({ text: `strings: ${arg}: No such file`, type: "error" });
            break;
          }
          if (node.binary && node.strings) {
            addLine("");
            for (const s of node.strings) {
              addLine({
                text: s,
                type: s.includes("FLAG{") ? "success" : "text",
              });
            }
            addLine("");
          } else if (node.content) {
            addLine("");
            for (const line of node.content) {
              if (line.trim()) addLine({ text: line, type: "text" });
            }
            addLine("");
          }
          break;
        }

        case "base64": {
          if (!arg) {
            addLine({ text: "Usage: base64 <encoded-text>", type: "error" });
            break;
          }
          try {
            const decoded = atob(arg);
            addLine({
              text: decoded,
              type: decoded.includes("FLAG{") ? "success" : "text",
            });
          } catch {
            addLine({ text: "base64: invalid input", type: "error" });
          }
          break;
        }

        case "curl": {
          if (!arg) {
            addLine({ text: "Usage: curl <url>", type: "error" });
            break;
          }
          addLine({ text: `Connecting to ${arg}...`, type: "dim" });
          await sleep(500);
          if (arg.includes("/api/secret") || arg.includes("api/secret")) {
            addLine({
              text: '{"status":"ok","data":"FLAG{curl_the_api}"}',
              type: "success",
            });
          } else if (arg.includes("robots.txt")) {
            const content = readFile("/var/www/robots.txt");
            if (content)
              content.forEach((l) =>
                addLine({
                  text: l,
                  type: l.includes("FLAG{") ? "success" : "text",
                }),
              );
          } else {
            addLine({
              text: `<!DOCTYPE html><html><body>Welcome to ${arg}</body></html>`,
              type: "text",
            });
          }
          break;
        }

        case "tcpdump":
        case "wireshark": {
          if (!arg) {
            addLine({ text: "Usage: tcpdump <file.pcap>", type: "error" });
            break;
          }
          const target = resolvePath(cwdRef.current, arg);
          const node = getNode(target);
          if (!node) {
            addLine({ text: `tcpdump: ${arg}: No such file`, type: "error" });
            break;
          }
          if (!node.packets) {
            addLine({
              text: `tcpdump: ${arg}: Not a pcap file`,
              type: "error",
            });
            break;
          }
          addLine("");
          addLine({ text: `Reading from ${arg}...`, type: "dim" });
          addLine({
            text: "  #    SRC               DST               PROTO  INFO",
            type: "accent",
          });
          addLine({
            text: "  ─    ───               ───               ─────  ────",
            type: "dim",
          });
          for (let i = 0; i < node.packets.length; i++) {
            await sleep(200);
            const p = node.packets[i];
            const line = `  ${String(i + 1).padEnd(5)}${p.src.padEnd(18)}${p.dst.padEnd(18)}${p.proto.padEnd(7)}${p.info}`;
            addLine({
              text: line,
              type: p.info.includes("FLAG{") ? "success" : "text",
            });
          }
          addLine("");
          addLine({
            text: `${node.packets.length} packets captured`,
            type: "dim",
          });
          addLine("");
          break;
        }

        case "nmap":
        case "scan": {
          if (scanning) {
            addLine({ text: "Scan already running...", type: "warning" });
            break;
          }
          setScanning(true);
          await runPortScan(addLine);
          unlock("port-scan");
          setScanning(false);
          break;
        }

        case "decrypt": {
          const result = await runDecrypt(arg, addLine);
          if (result) unlock("cipher-crack");
          break;
        }

        case "submit": {
          if (!arg) {
            addLine({ text: "Usage: submit FLAG{...}", type: "warning" });
            break;
          }
          handleFlagSubmit(arg);
          break;
        }

        case "flags": {
          const found = getFoundFlags();
          const total = getTotalFlags();
          addLine("");
          addLine({
            text: `  ${found.length}/${total} flags captured`,
            type: "accent",
          });
          addLine({
            text:
              "  " +
              Array.from({ length: total }, (_, i) =>
                found.includes(i + 1) ? "◆" : "◇",
              ).join(""),
            type: found.length === total ? "success" : "text",
          });
          addLine("");
          break;
        }

        case "hint": {
          const found = getFoundFlags();
          const next = getNextHint(found);
          if (!next) {
            addLine({ text: "All flags found.", type: "success" });
          } else {
            addLine({
              text: `  #${String(next.id).padStart(2, "0")}: ${next.hint}`,
              type: "dim",
            });
          }
          break;
        }

        case "clear":
        case "cls":
          setLines([]);
          break;

        case "exit":
        case "quit":
        case "q":
          window.location.href = "/";
          break;

        case "banner":
          addLine({ text: ASCII_BANNER, type: "ascii", color: COLORS.accent });
          addLine("");
          break;

        case "sudo":
          addLine({
            text: "Nice try. This incident will be reported.",
            type: "error",
          });
          break;

        case "rm":
          addLine({
            text: arg.includes("-rf") ? "Nice try." : "Permission denied.",
            type: "error",
          });
          break;

        case "touch":
          addLine({ text: "Read-only filesystem.", type: "error" });
          break;

        case "xxd": {
          if (!arg) {
            addLine({ text: "Usage: xxd <file>", type: "error" });
            break;
          }
          const content = readFile(resolvePath(cwdRef.current, arg));
          if (!content) {
            addLine({ text: `xxd: ${arg}: No such file`, type: "error" });
            break;
          }
          addLine("");
          const hex = content.join("\n");
          for (let i = 0; i < Math.min(hex.length, 160); i += 16) {
            const chunk = hex.slice(i, i + 16);
            const hexPart = [...chunk]
              .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
              .join(" ");
            const asciiPart = [...chunk]
              .map((c) =>
                c.charCodeAt(0) >= 32 && c.charCodeAt(0) < 127 ? c : ".",
              )
              .join("");
            addLine({
              text: `  ${i.toString(16).padStart(8, "0")}: ${hexPart.padEnd(48)} ${asciiPart}`,
              type: "dim",
            });
          }
          addLine("");
          break;
        }

        case "echo":
          addLine({ text: arg, type: "text" });
          break;

        case "date":
          addLine({ text: new Date().toString(), type: "text" });
          break;

        case "uname":
          addLine({
            text: "LucaOS 1.0.0 portfolio.dev x86_64 GNU/Linux",
            type: "text",
          });
          break;

        case "ping":
          addLine({
            text: `PING ${arg || "localhost"} (192.168.1.337): 64 bytes, time=0.042ms`,
            type: "text",
          });
          addLine({
            text: "1 packet transmitted, 1 received, 0% loss",
            type: "dim",
          });
          break;

        case "man":
          addLine({
            text: `No manual entry for ${arg || "???"}. Try "help".`,
            type: "dim",
          });
          break;

        case "ssh":
          addLine({ text: "You're already connected.", type: "dim" });
          break;

        case "wget":
          addLine({ text: "Use curl instead.", type: "dim" });
          break;

        case "vi":
        case "vim":
        case "nano":
          addLine({ text: `${cmd}: read-only session`, type: "error" });
          break;

        case "python":
        case "python3":
        case "node":
          addLine({
            text: `${cmd}: not available in this shell`,
            type: "error",
          });
          break;

        case "ifconfig":
        case "ip":
          addLine({ text: "eth0: 192.168.1.337/24 UP", type: "text" });
          addLine({ text: "lo:   127.0.0.1/8 UP", type: "text" });
          break;

        case "netstat":
          addLine({
            text: "Proto  Local Address        Foreign Address      State",
            type: "accent",
          });
          addLine({
            text: "tcp    0.0.0.0:22           0.0.0.0:*            LISTEN",
            type: "text",
          });
          addLine({
            text: "tcp    0.0.0.0:80           0.0.0.0:*            LISTEN",
            type: "text",
          });
          addLine({
            text: "tcp    0.0.0.0:443          0.0.0.0:*            LISTEN",
            type: "text",
          });
          addLine({
            text: "tcp    192.168.1.337:22     192.168.1.42:54321   ESTABLISHED",
            type: "success",
          });
          break;

        case "ps":
          addLine({ text: "  PID TTY      TIME CMD", type: "accent" });
          addLine({ text: "    1 pts/0    0:00 bash", type: "text" });
          addLine({ text: " 1337 pts/0    0:00 node server.js", type: "text" });
          addLine({ text: " 5337 pts/0    0:00 ???", type: "warning" });
          addLine({
            text: `${Math.floor(Math.random() * 9000) + 1000} pts/0    0:00 ps`,
            type: "text",
          });
          break;

        default:
          addLine({ text: `${cmd}: command not found`, type: "error" });
      }
    },
    [addLine, handleFlagSubmit, scanning, unlock],
  );

  const promptPath = cwd === HOME ? "~" : cwd.replace(HOME, "~");
  const prompt = `luca@portfolio:${promptPath}$`;

  useEffect(() => {
    registerCommands("ssh", {
      __help: [
        "flags         show flag progress",
        "hint          get next hint",
        "submit <flag> submit a flag",
        "nmap          run port scanner",
        "decrypt <txt> decrypt text",
        "boot          replay boot sequence",
        "access        show access level",
      ],
      flags: ({ out }) => {
        const found = getFoundFlags();
        out(`${found.length}/${getTotalFlags()} flags`, "sys");
      },
      hint: ({ out }) => {
        const found = getFoundFlags();
        const next = getNextHint(found);
        if (!next) out("All flags found!", "sys");
        else out(`#${next.id}: ${next.hint}`, "sys");
      },
      submit: ({ arg, out }) => {
        if (!arg) {
          out("Usage: submit FLAG{...}", "err");
          return;
        }
        const r = validateFlag(arg);
        if (!r.valid) out(r.error, "err");
        else if (r.alreadyFound) out(`Already found: ${r.flag.name}`, "sys");
        else {
          markFlagFound(r.flag.id);
          out(`Flag #${r.flag.id} captured`, "sys");
          unlock("first-flag");
          if (getFoundFlags().length >= getTotalFlags()) unlock("all-flags");
        }
      },
      nmap: ({ out }) =>
        out("Run nmap in the terminal for the full experience", "sys"),
      decrypt: ({ arg, out }) => {
        if (!arg) {
          out("Usage: decrypt <text>", "err");
          return;
        }
        const result = arg.replace(/[a-zA-Z]/g, (c) => {
          const base = c <= "Z" ? 65 : 97;
          return String.fromCharCode(
            ((c.charCodeAt(0) - base + 13) % 26) + base,
          );
        });
        out(`Result: ${result}`, "sys");
      },
      boot: ({ out }) => {
        sessionStorage.removeItem("hack-boot-seen");
        out("Boot reset. Refresh page.", "sys");
      },
      access: ({ out }) => {
        const found = getFoundFlags();
        const total = getTotalFlags();
        let level = "GUEST";
        if (found.length >= total) level = "ROOT";
        else if (found.length >= 10) level = "ADMIN";
        else if (found.length >= 5) level = "USER";
        else if (found.length >= 1) level = "GUEST+";
        out(`${level} (${found.length}/${total})`, "sys");
      },
    });
    return () => unregisterCommands("ssh");
  }, [unlock]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: COLORS.bg,
        overflow: "hidden",
      }}
    >
      {!booted && (
        <BootSequence
          onComplete={() => setBooted(true)}
          flagCount={getFoundFlags().length}
        />
      )}
      {booted && (
        <>
          <a
            href="/"
            style={{
              position: "fixed",
              top: 16,
              left: 16,
              color: COLORS.dim,
              textDecoration: "none",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "12px",
              zIndex: 10,
              transition: "color .2s",
            }}
            onMouseEnter={(e) => (e.target.style.color = COLORS.accent)}
            onMouseLeave={(e) => (e.target.style.color = COLORS.dim)}
          >
            ← hub
          </a>
          <div
            style={{
              position: "fixed",
              top: 16,
              right: 16,
              color: COLORS.dim,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              zIndex: 10,
            }}
          >
            {getFoundFlags().length}/{getTotalFlags()} flags
          </div>
          <Terminal
            onCommand={handleCommand}
            onComplete={handleComplete}
            lines={lines}
            prompt={prompt}
          />
        </>
      )}
    </div>
  );
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
