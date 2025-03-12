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
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
  </head>
  <body>
    <div>
      <form action="#" method="get" id="shorten-form">
        <div
          class="flex flex-col ml-[28%] mr-[28%] mt-10 bg-gray-100 p-5 font-bold"
        >
          <h1 class="text-3xl text-center p-5">URL Shortener</h1>
          <label for="url">Enter URL:</label>
          <input type="url" name="url" id="url" class="border-1" required />
          <br />
          <label for="shortCode">Enter ShortCode:</label>
          <input type="text" class="border" id="shortCode" name="shortCode" />
          <br />
          <button
            type="submit"
            class="bg-blue-500 p-4 text-white rounded-2xl ml-auto mr-auto"
          >
            Shorten
          </button>
          <br />
          <h1 class="text-3xl text-center p-2">Shortened URLs</h1>
          <ul id="shortened-urls"></ul>
        </div>
      </form>
    </div>

    <script>
    // Function to fetch existing shortened URLs from the server
const fetchShortenedUrls = async () => {
  // Fetch the list of shortened URLs from the server
  const response = await fetch("/links");
  
  // Parse the JSON response into an object
  const links = await response.json();
  
  // Get the DOM element to display the shortened URLs
  const shortenedUrlsElement = document.getElementById("shortened-urls");

  // Clear any existing list of shortened URLs before displaying the new list
  shortenedUrlsElement.innerHTML = "";

  // Loop through each entry (shortCode, url) in the links object
  for (const [shortCode, url] of Object.entries(links)) {
    // Create a new list item (<li>) for each shortened URL
    const li = document.createElement("li");
    
    // Set the inner HTML to include a link and the original URL
    li.innerHTML = `<a href="/${shortCode}" target="_blank">${window.location.origin}/${shortCode}</a> - ${url}`;
    
    // Append the list item to the <ul> element
    shortenedUrlsElement.appendChild(li);
  }
};

// Add an event listener to the form for handling submission
document
  .querySelector("#shorten-form")
  .addEventListener("submit", async (event) => {
    // Prevent the form from submitting the usual way (page reload)
    event.preventDefault(); 

    // Create a FormData object from the submitted form
    let formData = new FormData(event.target);
    
    // Extract the URL and shortCode from the form data
    let url = formData.get("url");
    let shortCode = formData.get("shortCode");

    try {
      // Send a POST request to the server to shorten the URL
      const response = await fetch("/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, shortCode }), // Send URL and shortCode as JSON
      });

      if (response.ok) {
        // If the response is successful, fetch the updated list of shortened URLs
        fetchShortenedUrls();
        
        // Alert the user that the URL has been shortened
        alert("URL shortened successfully!");
        
        // Reset the form fields
        event.target.reset();
      } else {
        // If there’s an error with the response, show the error message
        const errorMessage = await response.text();
        alert(errorMessage);
      }
    } catch (error) {
      // If an error occurs during the fetch (network issue, etc.), log the error and show an alert
      console.log(error);
      alert("An error occurred. Please try again.");
    }
  });

// Initial fetch to load any existing shortened URLs when the page loads
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
