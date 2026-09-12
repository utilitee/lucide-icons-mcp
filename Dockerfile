# lucide-icons-mcp — HTTP mode with Development Scripts on every container start
#
# The image bakes in dependencies and the browsers needed by `bun run crawl`
# (Playwright Firefox + Camoufox). The Development Scripts themselves run at
# container start via docker-entrypoint.sh, not at build time.

FROM oven/bun:1

# Native deps: sqlite3 (camoufox-js) may need a compiler; Playwright needs
# system libraries for Firefox (installed later via `playwright install --with-deps`).
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    g++ \
    make \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# HUSKY=0: the "prepare" script runs on install, but there is no .git in the image.
# CAMOUFOX_INSTALL_DIR: shared location used by both `camoufox-js fetch` and the crawler.
ENV HUSKY=0 \
    CAMOUFOX_INSTALL_DIR=/opt/camoufox

WORKDIR /app

# Install dependencies (uses the committed lockfile)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Download the browsers used by `bun run crawl` / `bun run pre-build`
RUN bunx playwright install --with-deps firefox \
    && bunx camoufox-js fetch

COPY . .

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

# On every container start: lint -> pre-build (crawl) -> build -> dev (HTTP mode)
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
