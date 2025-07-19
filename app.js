const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const port = 3001;

const htmlPath = path.join(__dirname, "index.html");
const jsonPath = path.join(__dirname, "links.json");

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/") {
    try {
      const data = await fs.readFile(htmlPath, "utf-8");
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    } catch (error) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    }
  }

  // ✅ Serve all links from links.json
  else if (req.method === "GET" && req.url === "/links") {
    try {
      const file = await fs.readFile(jsonPath, "utf-8");
      const links = JSON.parse(file);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(links));
    } catch (err) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end("[]");
    }
  }

  // ✅ Redirect to full URL using shortcode
  else if (req.method === "GET" && req.url !== "/favicon.ico") {
    const shortcode = req.url.slice(1);
    try {
      const file = await fs.readFile(jsonPath, "utf-8");
      const links = JSON.parse(file);
      const match = links.find(link => link.shortcode === shortcode);
      if (match) {
        res.writeHead(302, { Location: match.url });
        res.end();
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Shortlink not found");
      }
    } catch (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Data file not found");
    }
  }

  // ✅ Handle form submission
  else if (req.method === "POST" && req.url === "/submit") {
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const params = new URLSearchParams(body);
      const url = params.get("url");
      const shortcode = params.get("shortcode");

      let links = [];
      try {
        const file = await fs.readFile(jsonPath, "utf-8");
        links = JSON.parse(file);
      } catch (err) {
       let file_write=await fs.writeFile(jsonPath,links,"utf-8");
       console.log(file_write);
      }

      if (links.some(link => link.shortcode === shortcode)) {
        res.writeHead(409, { "Content-Type": "text/plain" });
        return res.end("Shortcode already exists!");
      }

      links.push({ shortcode, url });
      await fs.writeFile(jsonPath, JSON.stringify(links, null, 2));
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Shortlink saved successfully");
    });
  }

  // 🔁 Fallback
  else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Route not found");
  }
});

server.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
