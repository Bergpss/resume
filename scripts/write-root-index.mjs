import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const out = join(dirname(fileURLToPath(import.meta.url)), "../out/index.html");

writeFileSync(
  out,
  `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="refresh" content="0; url=/zh" />
    <link rel="canonical" href="https://resume.guoyibo.top/zh" />
    <title>Berg</title>
  </head>
  <body>
    <p>
      <a href="/zh">中文简历</a>
      ·
      <a href="/en">English resume</a>
    </p>
  </body>
</html>
`,
);

console.log("wrote", out);
