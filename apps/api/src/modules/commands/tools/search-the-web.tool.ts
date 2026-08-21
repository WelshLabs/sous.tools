import { Logger } from "@nestjs/common";
import { randomUUID } from "crypto";
import { serverConfig as config } from "@soustools/config/server";
import { Command } from "../command.decorator";
import { CommandTool, CommandExecutionContext } from "../command.interface";
import { searchTheWebTool } from "../commands-tools";

@Command(searchTheWebTool)
export class SearchTheWebTool implements CommandTool {
  private readonly logger = new Logger(SearchTheWebTool.name);

  async execute(args: any, context: CommandExecutionContext) {
    const agentMessageContent = `Searching the web for: "${args.query}"...`;
    if (context.emitMessage) {
      context.emitMessage({
        id: randomUUID(),
        role: "agent_step",
        content: agentMessageContent,
        timestamp: new Date(),
      });
    }

    const maxResults = (args.maxResults as number) || 5;
    const searchResults = await this.performWebSearch(
      args.query as string,
      maxResults,
    );
    return {
      success: true,
      query: args.query,
      results: searchResults,
      count: searchResults.length,
    };
  }

  private async performWebSearch(
    query: string,
    maxResults: number = 5,
  ): Promise<Array<{ title: string; snippet: string; url: string }>> {
    try {
      const tavilyKey = config.TAVILY_API_KEY;
      if (tavilyKey) {
        const res = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: tavilyKey,
            query,
            max_results: maxResults,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as any;
          if (data.results && Array.isArray(data.results)) {
            return data.results.map((r: any) => ({
              title: r.title || "",
              snippet: r.content || "",
              url: r.url || "",
            }));
          }
        }
      }

      const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const res = await fetch(ddgUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (!res.ok) {
        this.logger.warn(`DuckDuckGo HTTP status: ${res.status}`);
        return [];
      }

      const html = await res.text();
      const results: Array<{ title: string; snippet: string; url: string }> =
        [];

      const sanitize = (text: string) =>
        text
          .replace(/<[^>]+>/g, "")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#x27;/g, "'")
          .replace(/&#39;/g, "'")
          .replace(/\s+/g, " ")
          .trim();

      const resultBlockRegex =
        /<div[^>]*class="[^"]*result[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
      const titleRegex =
        /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i;
      const snippetRegex =
        /<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>|<td[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/td>/i;

      let match: RegExpExecArray | null;
      while (
        (match = resultBlockRegex.exec(html)) !== null &&
        results.length < maxResults
      ) {
        const block = match[1];
        const titleMatch = titleRegex.exec(block);
        const snippetMatch = snippetRegex.exec(block);

        if (titleMatch) {
          let rawUrl = titleMatch[1];
          if (rawUrl.includes("uddg=")) {
            const searchParams = new URLSearchParams(
              rawUrl.split("?")[1] || "",
            );
            rawUrl = searchParams.get("uddg") || rawUrl;
          }

          const title = sanitize(titleMatch[2]);
          const snippet = snippetMatch
            ? sanitize(snippetMatch[1] || snippetMatch[2] || "")
            : "";

          if (title && rawUrl) {
            results.push({ title, snippet, url: rawUrl });
          }
        }
      }

      if (results.length === 0) {
        const globalARegex =
          /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        let aMatch: RegExpExecArray | null;
        while (
          (aMatch = globalARegex.exec(html)) !== null &&
          results.length < maxResults
        ) {
          let rawUrl = aMatch[1];
          if (rawUrl.includes("uddg=")) {
            const searchParams = new URLSearchParams(
              rawUrl.split("?")[1] || "",
            );
            rawUrl = searchParams.get("uddg") || rawUrl;
          }
          const title = sanitize(aMatch[2]);
          if (title && rawUrl) {
            results.push({ title, snippet: "", url: rawUrl });
          }
        }
      }

      return results;
    } catch (err: any) {
      this.logger.error(
        `Error performing web search: ${err.message}`,
        err.stack,
      );
      return [];
    }
  }
}
