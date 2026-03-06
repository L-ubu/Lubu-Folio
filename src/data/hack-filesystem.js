const FS = {
  type: "dir",
  children: {
    home: {
      type: "dir",
      children: {
        luca: {
          type: "dir",
          children: {
            ".bashrc": {
              type: "file",
              content: [
                "# ~/.bashrc",
                "",
                'export PS1="\\u@portfolio:\\w\\$ "',
                "alias ll='ls -la'",
                "alias cls='clear'",
                "alias grep='grep --color=auto'",
                "",
                "# TODO: rotate credentials before deploy",
                "# see /home/luca/projects/portfolio/.env",
              ],
            },
            ".bash_history": {
              type: "file",
              content: [
                "cd projects/portfolio",
                "cat .env",
                "git log --oneline",
                "npm run build",
                "curl localhost:3000/api/secret",
                "echo 'FLAG{history_repeats}' > /dev/null",
                "nmap -sV portfolio.dev",
                "ssh-keygen -t ed25519",
                "cat /etc/passwd",
                "grep -r 'password' .",
                "base64 -d notes/encoded.txt",
              ],
            },
            ".flag": {
              type: "file",
              content: [
                "You found a hidden file!",
                "",
                "FLAG{hidden_in_plain_sight}",
              ],
            },
            ".vimrc": {
              type: "file",
              content: [
                "set number",
                "set relativenumber",
                "set tabstop=2",
                "set shiftwidth=2",
                "syntax on",
                "colorscheme gruvbox",
              ],
            },
            projects: {
              type: "dir",
              children: {
                portfolio: {
                  type: "dir",
                  children: {
                    "README.md": {
                      type: "file",
                      content: [
                        "# Luca's Portfolio",
                        "",
                        "Multi-dimensional portfolio experience.",
                        "Built with Astro, React, Three.js, and too much caffeine.",
                        "",
                        "## Secrets",
                        "",
                        "There are flags hidden throughout this site.",
                        "Some are in the code, some in the browser,",
                        "some in the network, some where you least expect.",
                        "",
                        "Good luck finding them all.",
                      ],
                    },
                    ".env": {
                      type: "file",
                      content: [
                        "# DEPLOYMENT SECRETS — DO NOT COMMIT",
                        "DATABASE_URL=postgres://luca:hunter2@db.portfolio.dev:5432/main",
                        "API_KEY=sk-live-not-a-real-key-nice-try",
                        "SECRET_FLAG=FLAG{dotenv_detective}",
                        "NODE_ENV=production",
                        "REDIS_URL=redis://localhost:6379",
                      ],
                    },
                    ".gitignore": {
                      type: "file",
                      content: [
                        ".env",
                        "node_modules/",
                        "dist/",
                        ".DS_Store",
                        "*.log",
                      ],
                    },
                    "package.json": {
                      type: "file",
                      content: [
                        "{",
                        '  "name": "lubu-folio",',
                        '  "version": "1.0.0",',
                        '  "scripts": {',
                        '    "dev": "astro dev",',
                        '    "build": "astro build",',
                        '    "preview": "astro preview"',
                        "  }",
                        "}",
                      ],
                    },
                  },
                },
                secret: {
                  type: "dir",
                  children: {
                    "encrypted.txt": {
                      type: "file",
                      content: [
                        "=== ENCRYPTED MESSAGE ===",
                        "",
                        "SYNT{pvcure_penpxre}",
                        "",
                        "Hint: This is a simple substitution cipher.",
                        "Each letter is shifted by the same amount.",
                      ],
                    },
                    "notes.txt": {
                      type: "file",
                      content: [
                        "Personal notes — do not share",
                        "",
                        "- Remember to check robots.txt on live site",
                        "- The 404 page has a surprise",
                        "- CSS variables can store more than colors",
                        "- Cookies aren't just for eating",
                        "- localStorage is not as private as you think",
                      ],
                    },
                  },
                },
                tools: {
                  type: "dir",
                  children: {
                    "scanner.bin": {
                      type: "file",
                      binary: true,
                      strings: [
                        "ELF",
                        "/lib64/ld-linux-x86-64.so.2",
                        "libcrypto.so.1.1",
                        "scan_init",
                        "connect_target",
                        "FLAG{strings_attached}",
                        "send_payload",
                        "cleanup",
                        "Usage: scanner <target> <port>",
                      ],
                      content: [
                        "scanner.bin: ELF 64-bit LSB executable",
                        "This is a binary file. Try: strings scanner.bin",
                      ],
                    },
                    "keygen.py": {
                      type: "file",
                      content: [
                        "#!/usr/bin/env python3",
                        "import hashlib",
                        "import sys",
                        "",
                        "def generate_key(seed):",
                        "    return hashlib.sha256(seed.encode()).hexdigest()[:16]",
                        "",
                        'if __name__ == "__main__":',
                        '    print(f"Key: {generate_key(sys.argv[1])}")',
                      ],
                    },
                  },
                },
              },
            },
            notes: {
              type: "dir",
              children: {
                "todo.md": {
                  type: "file",
                  content: [
                    "# TODO",
                    "",
                    "- [x] Build portfolio",
                    "- [x] Add easter eggs",
                    "- [x] Hide flags for CTF",
                    "- [ ] Add more minigames",
                    "- [ ] Fix that one CSS bug",
                    "- [ ] Sleep",
                  ],
                },
                "encoded.txt": {
                  type: "file",
                  content: [
                    "This message is base64 encoded:",
                    "",
                    "RkxBR3tiYXNlNjRfaXNfbm90X2VuY3J5cHRpb259",
                  ],
                },
                "ideas.md": {
                  type: "file",
                  content: [
                    "# Portfolio Ideas",
                    "",
                    "- Interactive terminal (done!)",
                    "- Hidden CTF challenges (done!)",
                    "- Konami code easter egg",
                    "- Custom 404 page with secrets",
                    "- Data attributes with hidden messages",
                    "- Strudel music integration",
                  ],
                },
              },
            },
            logs: {
              type: "dir",
              children: {
                "access.log": {
                  type: "file",
                  content: [
                    "[2026-02-27 03:14:15] GET /portfolio HTTP/1.1 200",
                    "[2026-02-27 03:14:16] GET /assets/style.css HTTP/1.1 200",
                    "[2026-02-27 03:14:17] GET /api/secret HTTP/1.1 403 Forbidden",
                    "[2026-02-27 03:15:42] POST /api/login HTTP/1.1 401 Unauthorized",
                    "[2026-02-27 03:15:44] POST /api/login HTTP/1.1 200 OK",
                    "[2026-02-27 03:16:01] GET /portfolio HTTP/1.1 200",
                    "[2026-02-27 03:17:22] GET /ssh HTTP/1.1 200",
                    "[2026-02-27 03:18:05] suspicious: scan detected on port range 1-65535",
                    "[2026-02-27 03:18:06] port 5337 responded with unusual payload",
                    "[2026-02-27 03:19:10] GET /robots.txt HTTP/1.1 200",
                    "[2026-02-27 03:20:30] GET /nonexistent HTTP/1.1 404",
                  ],
                },
                "auth.log": {
                  type: "file",
                  content: [
                    "[sshd] Connection from 192.168.1.337 port 22",
                    "[sshd] Accepted publickey for luca",
                    "[sshd] session opened for user luca",
                    "[sudo] luca : TTY=pts/0 ; COMMAND=/usr/bin/cat /etc/shadow",
                    "[sudo] pam_unix: authentication failure; user=guest",
                  ],
                },
                "cron.log": {
                  type: "file",
                  content: [
                    "[cron] 0 * * * * /usr/local/bin/backup.sh",
                    "[cron] 0 3 * * * /usr/local/bin/rotate-secrets.sh",
                    "[cron] job completed: backup.sh (exit 0)",
                    "[cron] job completed: rotate-secrets.sh (exit 0)",
                    "[cron] next run: rotate-secrets.sh in 6h",
                  ],
                },
              },
            },
            ".ssh": {
              type: "dir",
              children: {
                id_rsa: {
                  type: "file",
                  content: [
                    "-----BEGIN OPENSSH PRIVATE KEY-----",
                    "b3BlbnNzaC1rZXktdjEAAAAABG5vbmU=",
                    "ZmFrZWtleWZha2VrZXlmYWtla2V5Zg==",
                    "dGhpcyBpcyBub3QgYSByZWFsIGtleQ==",
                    "bG9vayBlbHNld2hlcmUgOik=",
                    "-----END OPENSSH PRIVATE KEY-----",
                  ],
                },
                known_hosts: {
                  type: "file",
                  content: [
                    "portfolio.dev ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFakeHostKey",
                    "192.168.1.337 ssh-rsa AAAAB3NzaC1yc2EAAAADAQFakeRSAKey",
                  ],
                },
              },
            },
          },
        },
      },
    },
    etc: {
      type: "dir",
      children: {
        passwd: {
          type: "file",
          content: [
            "root:x:0:0:root:/root:/bin/bash",
            "luca:x:1000:1000:Luca Vandenweghe:/home/luca:/bin/bash",
            "guest:x:1001:1001:Guest:/home/guest:/bin/rbash",
            "www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin",
            "postgres:x:999:999:PostgreSQL:/var/lib/postgresql:/bin/bash",
          ],
        },
        hostname: {
          type: "file",
          content: ["portfolio.dev"],
        },
        crontab: {
          type: "file",
          content: [
            "# /etc/crontab — system-wide cron",
            "SHELL=/bin/bash",
            "PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin",
            "",
            "# m h dom mon dow user command",
            "0 * * * * root /usr/local/bin/backup.sh",
            "0 3 * * * root /usr/local/bin/rotate-secrets.sh",
            "*/5 * * * * root echo 'FLAG{crontab_snoop}' | logger",
            "30 2 * * 0 root /usr/local/bin/cleanup.sh",
          ],
        },
      },
    },
    var: {
      type: "dir",
      children: {
        log: {
          type: "dir",
          children: {
            syslog: {
              type: "file",
              content: [
                "Feb 27 03:14:15 portfolio systemd[1]: Started Astro Server.",
                "Feb 27 03:14:16 portfolio nginx[1234]: listening on port 80",
                "Feb 27 03:14:16 portfolio nginx[1234]: listening on port 443",
                "Feb 27 03:18:05 portfolio scanner[5337]: incoming scan detected",
              ],
            },
          },
        },
        www: {
          type: "dir",
          children: {
            "robots.txt": {
              type: "file",
              content: [
                "User-agent: *",
                "Allow: /",
                "Disallow: /api/secret",
                "",
                "# FLAG{robots_welcome}",
                "# Sitemap: https://portfolio.dev/sitemap.xml",
              ],
            },
          },
        },
      },
    },
    tmp: {
      type: "dir",
      children: {
        "capture.pcap": {
          type: "file",
          binary: true,
          packets: [
            {
              src: "192.168.1.42",
              dst: "192.168.1.337",
              proto: "TCP",
              info: "SYN → port 80",
            },
            {
              src: "192.168.1.337",
              dst: "192.168.1.42",
              proto: "TCP",
              info: "SYN-ACK",
            },
            {
              src: "192.168.1.42",
              dst: "192.168.1.337",
              proto: "HTTP",
              info: "GET /api/secret",
            },
            {
              src: "192.168.1.337",
              dst: "192.168.1.42",
              proto: "HTTP",
              info: '403 {"error":"forbidden"}',
            },
            {
              src: "192.168.1.42",
              dst: "192.168.1.337",
              proto: "HTTP",
              info: "GET /api/secret?auth=admin",
            },
            {
              src: "192.168.1.337",
              dst: "192.168.1.42",
              proto: "HTTP",
              info: '200 {"flag":"FLAG{packet_sniffer}"}',
            },
            {
              src: "192.168.1.42",
              dst: "192.168.1.337",
              proto: "TCP",
              info: "FIN",
            },
          ],
          content: [
            "capture.pcap: tcpdump capture file",
            "This is a packet capture. Try: tcpdump capture.pcap",
          ],
        },
      },
    },
  },
};

export function resolvePath(cwd, target) {
  if (!target) return cwd;

  let parts;
  if (target.startsWith("/")) {
    parts = target.split("/").filter(Boolean);
  } else {
    parts = [
      ...cwd.split("/").filter(Boolean),
      ...target.split("/").filter(Boolean),
    ];
  }

  const resolved = [];
  for (const p of parts) {
    if (p === ".") continue;
    if (p === "..") {
      resolved.pop();
    } else {
      resolved.push(p);
    }
  }
  return "/" + resolved.join("/");
}

export function getNode(path) {
  const parts = path.split("/").filter(Boolean);
  let node = FS;
  for (const p of parts) {
    if (!node || node.type !== "dir" || !node.children[p]) return null;
    node = node.children[p];
  }
  return node;
}

export function listDir(path, showHidden = false) {
  const node = getNode(path);
  if (!node || node.type !== "dir") return null;
  return Object.keys(node.children)
    .filter((name) => showHidden || !name.startsWith("."))
    .sort((a, b) => {
      const aDir = node.children[a].type === "dir";
      const bDir = node.children[b].type === "dir";
      if (aDir !== bDir) return aDir ? -1 : 1;
      return a.localeCompare(b);
    })
    .map((name) => ({
      name,
      isDir: node.children[name].type === "dir",
    }));
}

export function readFile(path) {
  const node = getNode(path);
  if (!node || node.type !== "file") return null;
  return node.content;
}

export function getCompletions(cwd, partial) {
  const lastSlash = partial.lastIndexOf("/");
  let dirPath, prefix;

  if (lastSlash >= 0) {
    const dirPart = partial.slice(0, lastSlash) || "/";
    dirPath = resolvePath(cwd, dirPart);
    prefix = partial.slice(lastSlash + 1);
  } else {
    dirPath = cwd;
    prefix = partial;
  }

  const entries = listDir(dirPath, true);
  if (!entries) return [];

  return entries
    .filter((e) => e.name.startsWith(prefix))
    .map((e) => {
      const basePath = lastSlash >= 0 ? partial.slice(0, lastSlash + 1) : "";
      return basePath + e.name + (e.isDir ? "/" : "");
    });
}

function grepNode(node, path, pattern, results) {
  if (node.type === "file" && node.content) {
    for (let i = 0; i < node.content.length; i++) {
      if (node.content[i].toLowerCase().includes(pattern.toLowerCase())) {
        results.push({ file: path, line: i + 1, text: node.content[i] });
      }
    }
  } else if (node.type === "dir" && node.children) {
    for (const [name, child] of Object.entries(node.children)) {
      grepNode(
        child,
        path === "/" ? `/${name}` : `${path}/${name}`,
        pattern,
        results,
      );
    }
  }
}

export function grepFiles(startPath, pattern) {
  const node = getNode(startPath);
  if (!node) return [];
  const results = [];
  grepNode(node, startPath, pattern, results);
  return results;
}

export const HOME = "/home/luca";
