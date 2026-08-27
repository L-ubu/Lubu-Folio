import { useState, useEffect, useCallback } from "react";
import BackToHub from "../shared/BackToHub";
import { useAchievementStore } from "../achievements/store";
import { registerCommands, unregisterCommands } from "../shared/DevConsole";
import { getStored, setStored } from "../../utils/storage";
import { articles } from "../../data/blog-articles";
import WarRoom from "./WarRoom";
import ArticleView from "./ArticleView";

export default function BlogApp() {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [readArticles, setReadArticles] = useState(() =>
    getStored("warroom-read", []),
  );
  const unlock = useAchievementStore((s) => s.unlock);

  useEffect(() => {
    unlock("warroom-enter");
  }, [unlock]);

  const markRead = useCallback(
    (articleId) => {
      setReadArticles((prev) => {
        if (prev.includes(articleId)) return prev;
        const next = [...prev, articleId];
        setStored("warroom-read", next);
        if (next.length === 1) unlock("warroom-first-read");
        if (next.length >= articles.length) unlock("warroom-all-read");
        return next;
      });
    },
    [unlock],
  );

  const handleSelect = useCallback(
    (article) => {
      setSelectedArticle(article);
      markRead(article.id);
    },
    [markRead],
  );

  const handleBack = useCallback((readDuration) => {
    if (readDuration !== undefined && readDuration < 30) {
      unlock("warroom-speed-reader");
    }
    setSelectedArticle(null);
  }, [unlock]);

  useEffect(() => {
    registerCommands("blog", {
      __help: [
        "list          show all articles",
        "read <id>     open an article",
        "back          return to war room",
        "categories    list categories",
        "status        show read progress",
      ],
      list: ({ out }) => {
        out("Available intelligence:", "sys");
        articles.forEach((a) => {
          const read = readArticles.includes(a.id) ? "✓" : " ";
          out(`  [${read}] ${a.id} — ${a.title}`);
        });
      },
      read: ({ arg, out }) => {
        if (!arg) {
          out("Usage: read <article-id>", "err");
          return;
        }
        const article = articles.find((a) => a.id === arg);
        if (!article) {
          out(`Article not found: ${arg}`, "err");
          return;
        }
        handleSelect(article);
        out(`Opening: ${article.title}`, "sys");
      },
      back: ({ out }) => {
        setSelectedArticle(null);
        out("Returning to war room", "sys");
      },
      categories: ({ out }) => {
        out("Categories:", "sys");
        out("  bounties   — BOUNTIES // HACKS");
        out("  workshops  — WORKSHOPS // TALKS");
        out("  reports    — REPORTS // WRITE-UPS");
      },
      status: ({ out }) => {
        out(
          `Intel progress: ${readArticles.length}/${articles.length}`,
          "sys",
        );
        if (readArticles.length >= articles.length) out("FULLY BRIEFED", "sys");
      },
    });
    return () => unregisterCommands("blog");
  }, [readArticles, handleSelect, handleBack]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050505",
        cursor: "default",
      }}
    >
      <BackToHub />

      {selectedArticle ? (
        <ArticleView article={selectedArticle} onBack={handleBack} />
      ) : (
        <WarRoom
          onSelectArticle={handleSelect}
          readArticles={readArticles}
        />
      )}
    </div>
  );
}
