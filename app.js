let http = require("http");
let path = require("path");
const { readFile, writeFile } = require("fs/promises"); // Import promises-based FS methods
let crypto = require("crypto");

const DATA_FILE = path.join("data", "links.json");
let filename = "index.html";
let pathname = path.join(__dirname, filename);

// Load links from the data file
const loadLinks = async () => {
  try {
    const data = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(data); // Corrected JSON.parse
  } catch (error) {
    if (error.code === "ENOENT") {
      await writeFile(DATA_FILE, JSON.stringify({}));
      return {}; // If file doesn't exist, return empty object
    }
    throw error; // Rethrow error for other cases
  }
};

// Save links to the data file
const saveLinks = async (links) => {
  await writeFile(DATA_FILE, JSON.stringify(links, null, 2)); // Corrected JSON.stringify with indentation for readability
};

// Create the HTTP server
let server = http.createServer(async (req, res) => {
  // Handle the home page
  if (req.method === "GET") {
    if (req.url === "/") {
      try {
        let ans = await readFile(pathname);
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(ans);
      } catch {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("404 page not found");
      }
    }
    // Handle the links endpoint for displaying all shortened links
    else if (req.url === "/links") {
      const links = await loadLinks();
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(links));
    }
    // Handle the redirect for shortened URLs
    else {
      const shortCode = req.url.substring(1); // Extract the short code from the URL
      const links = await loadLinks();

      // Check if the short code exists in the links
      if (links[shortCode]) {
        // Redirect to the long URL
        res.writeHead(301, { "Location": links[shortCode] }); // 301 Moved Permanently
        return res.end();
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        return res.end("Short code not found");
      }
    }
  }

  // Handle POST request to shorten the URL
  if (req.method === "POST" && req.url === "/shorten") {
    let body = "";

    // Collect chunks of the body
    req.on("data", (chunk) => {
      body += chunk; // Append data to the body
    });

    // When the entire body is received
    req.on("end", async () => {
      try {
        const { url, shortCode } = JSON.parse(body); // Parse the incoming JSON

        if (!url) {
          res.writeHead(400, { "Content-Type": "text/plain" });
          return res.end("URL is required");
        }

        const links = await loadLinks(); // Load existing links

        // Generate short code if not provided
        const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");

        if (links[finalShortCode]) {
          res.writeHead(400, { "Content-Type": "text/plain" });
          return res.end("Short code already exists. Please choose another.");
        }

        // Add the link to the links object
        links[finalShortCode] = url;

        // Save updated links to file
        await saveLinks(links);

        // Respond with the updated links
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(links)); // Respond with the entire updated links object
      } catch (error) {
        console.error("Error processing request:", error);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Server error: " + error.message);
      }
    });
  }
});

// Start the server on port 3003
let port = 3003;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
