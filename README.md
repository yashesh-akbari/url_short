---

# URL Shortener Project

This is a simple URL shortener built with Node.js. It allows users to shorten URLs and stores the short-to-long URL mapping in a `links.json` file. The project also provides a basic web interface to interact with the service.

## **Live Demo**
You can view the live demo of the Url Shortener at the following link:

[Live Demo](https://url-short-node.vercel.app/)


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
      <!-- Form to take input for URL and custom short code -->
      <form action="#" method="get" id="shorten-form">
        <div>
          <h1>URL Shortener</h1>
          
          <!-- Input field for the long URL -->
          <label for="url">Enter URL:</label>
          <input type="url" name="url" id="url" required />
          <br />
          
          <!-- Input field for optional custom short code -->
          <label for="shortCode">Enter ShortCode:</label>
          <input type="text" id="shortCode" name="shortCode" />
          <br />
          
          <!-- Submit button to shorten the URL -->
          <button type="submit">Shorten</button>
          <br />
          
          <h2>Shortened URLs</h2>
          <!-- Unordered list to display the shortened URLs -->
          <ul id="shortened-urls"></ul>
        </div>
      </form>
    </div>

    <script>
      // Function to fetch and display the list of shortened URLs from the server
      const fetchShortenedUrls = async () => {
        const response = await fetch("/links"); // Fetch links from the /links endpoint
        const links = await response.json(); // Convert the response to JSON
        const listElement = document.getElementById("shortened-urls");

        // Iterate through the fetched links and display them
        links.forEach((link) => {
          const li = document.createElement("li"); // Create a new list item
          li.innerHTML = `<a href="/${link.shortCode}" target="_blank">${window.location.origin}/${link.shortCode}</a> - ${link.url}`;
          listElement.appendChild(li); // Append the item to the list
        });
      };

      // Add an event listener to the form for submitting
      document
        .querySelector("#shorten-form")
        .addEventListener("submit", async (event) => {
          event.preventDefault(); // Prevent the form from reloading the page

          const formData = new FormData(event.target); // Get form data
          const url = formData.get("url"); // Get the long URL from the form
          const shortCode = formData.get("shortCode"); // Get the custom short code (if any)

          // Send a POST request to the server to shorten the URL
          const response = await fetch("/shorten", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url, shortCode }), // Send the data as JSON
          });

          // If successful, update the displayed list of shortened URLs
          if (response.ok) {
            fetchShortenedUrls(); 
            alert("URL shortened successfully!"); // Show a success message
            event.target.reset(); // Reset the form
          } else {
            alert("Error: " + await response.text()); // Show error message if any
          }
        });

      // Fetch and display the shortened URLs when the page loads
      fetchShortenedUrls();
    </script>
  </body>
</html>
```

#### **app.js**: (Backend)

This file contains the backend code using Node.js to handle requests and manage the URL shortening logic.

```javascript
let http = require("http");
let path = require("path");
const { readFile, writeFile } = require("fs/promises"); // Import promises-based FS methods
let crypto = require("crypto");

const DATA_FILE = path.join("data", "links.json"); // Path to the JSON file for storing shortened URLs
let filename = "index.html"; // Name of the HTML file to serve
let pathname = path.join(__dirname, filename); // Full path to the HTML file

// Function to load links from the data file
const loadLinks = async () => {
  try {
    const data = await readFile(DATA_FILE, "utf-8"); // Read the file content
    return JSON.parse(data); // Parse the JSON data
  } catch (error) {
    if (error.code === "ENOENT") {
      // If file doesn't exist, create it with an empty object
      await writeFile(DATA_FILE, JSON.stringify({}));
      return {}; // Return an empty object
    }
    throw error; // If another error occurs, throw it
  }
};

// Function to save links to the data file
const saveLinks = async (links) => {
  await writeFile(DATA_FILE, JSON.stringify(links, null, 2)); // Write the links as JSON to the file with pretty indentation
};

// Create the HTTP server
let server = http.createServer(async (req, res) => {
  // Handle the home page
  if (req.method === "GET") {
    if (req.url === "/") {
      try {
        let ans = await readFile(pathname); // Read the index.html file
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(ans); // Send the HTML file as the response
      } catch {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("404 page not found");
      }
    }
    // Handle the links endpoint to fetch all shortened links
    else if (req.url === "/links") {
      const links = await loadLinks(); // Get all the links
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(links)); // Respond with the links in JSON format
    }
    // Handle redirect when a shortened URL is accessed
    else {
      const shortCode = req.url.substring(1); // Extract the short code from the URL
      const links = await loadLinks(); // Load the links from the file

      // Check if the short code exists in the links
      if (links[shortCode]) {
        // Redirect to the long URL if the short code exists
        res.writeHead(301, { "Location": links[shortCode] }); // Moved Permanently status
        return res.end(); // End the response
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        return res.end("Short code not found");
      }
    }
  }

  // Handle POST request to shorten the URL
  if (req.method === "POST" && req.url === "/shorten") {
    let body = "";

    // Collect the data sent in the request body
    req.on("data", (chunk) => {
      body += chunk; // Append the chunks of data
    });

    // Once the entire body is received, process the data
    req.on("end", async () => {
      try {
        const { url, shortCode } = JSON.parse(body); // Parse the incoming data

        if (!url) {
          res.writeHead(400, { "Content-Type": "text/plain" });
          return res.end("URL is required"); // Return an error if no URL is provided
        }

        const links = await loadLinks(); // Load the existing links

        // Generate a random short code if one is not provided
        const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");

        if (links[finalShortCode]) {
          res.writeHead(400, { "Content-Type": "text/plain" });
          return res.end("Short code already exists. Please choose another.");
        }

        // Add the new short code and URL to the links object
        links[finalShortCode] = url;

        // Save the updated links back to the file
        await saveLinks(links);

        // Respond with the updated list of links
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(links));
      } catch (error) {
        console.error("Error processing request:", error);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Server error: " + error.message);
      }
    });
  }
});

// Start the server
let port = 3003;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
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
