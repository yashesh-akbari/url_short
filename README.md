---

# URL Shortener Project

This is a simple URL shortener built with Node.js. It allows users to shorten URLs and stores the short-to-long URL mapping in a `links.json` file. The project also provides a basic web interface to interact with the service.

## Features
- **Shorten URLs**: Convert long URLs into shorter ones.
- **Custom Short Codes**: Optionally specify a custom short code for your shortened URL.
- **Redirection**: When you visit a shortened URL, it redirects you to the original URL.
- **Data Storage**: Shortened URLs and their corresponding long URLs are stored in a `links.json` file.

---

## Project Structure

```
url_short/
├── data/
│   └── links.json           # Stores the mapping of short codes to URLs.
├── app.js                   # The main server logic (Node.js).
└── index.html               # The frontend HTML page for the URL shortener form.
```

---

## Step-by-Step Guide to Build the Project

### 1. **Create Project Directory**

First, create a directory for your project:

```bash
mkdir url_short
cd url_short
```

### 2. **Create the Project Files**

Inside the `url_short` directory, create the following files:

#### **index.html**: (Frontend)

This file contains the HTML form where users can input their long URL and optionally specify a custom short code.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>URL Shortener</title>
  </head>
  <body>
    <div>
      <form action="#" method="get" id="shorten-form">
        <div>
          <h1>URL Shortener</h1>
          <label for="url">Enter URL:</label>
          <input type="url" name="url" id="url" required />
          <br />
          <label for="shortCode">Enter ShortCode:</label>
          <input type="text" id="shortCode" name="shortCode" />
          <br />
          <button type="submit">Shorten</button>
          <br />
          <h2>Shortened URLs</h2>
          <ul id="shortened-urls"></ul>
        </div>
      </form>
    </div>

    <script>
      const fetchShortenedUrls = async () => {
        const response = await fetch("/links");
        const links = await response.json();
        const listElement = document.getElementById("shortened-urls");

        links.forEach((link) => {
          const li = document.createElement("li");
          li.innerHTML = `<a href="/${link.shortCode}" target="_blank">${window.location.origin}/${link.shortCode}</a> - ${link.url}`;
          listElement.appendChild(li);
        });
      };

      document
        .querySelector("#shorten-form")
        .addEventListener("submit", async (event) => {
          event.preventDefault();

          const formData = new FormData(event.target);
          const url = formData.get("url");
          const shortCode = formData.get("shortCode");

          const response = await fetch("/shorten", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url, shortCode }),
          });

          if (response.ok) {
            fetchShortenedUrls();
            alert("URL shortened successfully!");
            event.target.reset();
          } else {
            alert("Error: " + await response.text());
          }
        });

      fetchShortenedUrls();
    </script>
  </body>
</html>
```

#### Explanation:
- **HTML Structure**: A simple form with input fields to enter the long URL and optionally a custom short code. The user can submit the form to shorten the URL.
- **JavaScript**: Handles form submission and dynamically updates the list of shortened URLs on the page. It also fetches and displays the list of shortened URLs from the backend.

#### **app.js**: (Backend)

This file contains the backend code using Node.js to handle requests and manage the URL shortening logic.

```javascript
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
```

#### Explanation:
- **Node.js HTTP Server**: The server listens for GET and POST requests.
  - **GET `/`** serves the `index.html` page.
  - **GET `/links`** returns all the shortened URLs in JSON format.
  - **POST `/shorten`** creates a new shortened URL and stores it in the `links.json` file.
- **File Handling**: Uses `fs/promises` to read and write JSON data to `links.json`.
- **Redirection**: When visiting a shortened URL, the server redirects to the corresponding long URL.

#### **links.json**: (Data Storage)

This JSON file stores the mappings between short codes and their original URLs. Each entry has a short code (e.g., `port`) as the key and the corresponding long URL as the value.

```json
{
  "port": "https://yashesh-akbari-portfolio.netlify.app/",
  "portfolie": "yashesh port folio"
}
```

---

## Running the Project

### 1. **Install Node.js**

If you don't have Node.js installed, download and install it from [here](https://nodejs.org/).

### 2. **Install Dependencies**

Navigate to your project folder (`url_short`) and run:

```bash
npm init -y  # Initializes a new Node.js project (creates package.json)
npm install  # Installs any necessary dependencies (if needed)
```

### 3. **Run the Server**

Run the server using the following command:

```bash
node app.js
```

This will start the server on `http://localhost:3003`.

### 4. **Open the App**

Open your browser and go to `http://localhost:3003`. You should see the URL shortener form.

### 5. **Test the URL Shortener**

- **Submit a URL**: Enter a long URL and (optionally) a custom short code.
- **Get the Shortened URL**: After submitting, the page will show the shortened URL.
- **Visit the Shortened URL**: Click the shortened URL to be redirected to the original URL.

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---
