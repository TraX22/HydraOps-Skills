# Documents

Converts a web page, a PDF, a Word, Excel or PowerPoint file, and other formats, to Markdown.

- Server: [markitdown-mcp](https://github.com/microsoft/markitdown) `0.0.1a7`, started with `uvx`.
- One tool, `convert_to_markdown`, which takes an `http:`, `https:`, `file:` or `data:` address.

It is classified as reading third-party content **and** acting, because it opens whatever address it is given, files on this computer included, without HydraOps's own checks on addresses. A task that has not read anything from outside uses it freely; once it has, the call waits for your approval. HydraOps's guard still refuses the paths of credentials and key stores.
