const http = require("http");
const request = require("request");
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const config = require("./config.json");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const cacheDir = config.cache_dir || path.join(__dirname, "cache");
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

http
  .createServer((req, res) => {
    let requestBody = "";

    req.on("data", chunk => {
      requestBody += chunk.toString();
    });

    req.on("end", () => {
      let data = {};

      try {
        data = JSON.parse(requestBody);
      } catch (err) {}

      const requestHash = crypto
        .createHash("md5")
        .update(`${config.server_uri}:${req.url}:${requestBody}`)
        .digest("hex");

      const fileCache = path.join(cacheDir, requestHash);

      if (fs.existsSync(fileCache)) {
        const data = fs.readFileSync(fileCache, "utf8");

        try {
          const { status, headers, body } = JSON.parse(data);
          res.writeHead(status, headers);
          res.end(body);
          console.log(`[${new Date().toISOString()}] [${req.method}] cached response for: [${requestBody.slice(0, 30)}]`);
        } catch (e) {
          console.log("An error occurred while loading the cached response", e);
        }
      } else {
        const server_host = new URL(config.server_uri);

        const headers = {
          ...req.headers,
          host: server_host.host
        };

        request(
          server_host.href,
          {
            method: req.method,
            headers: headers,
            body: requestBody
          },
          (error, response, responseBody) => {
            if (error) {
              res.writeHead(
                (response && response.statusCode) || 500,
                (response && response.headers) || {}
                );
                res.end("");
                console.log(`[${new Date().toISOString()}] [${req.method}] response for: [${requestBody.slice(0, 30)}]`);
              return;
            }
            res.writeHead(response.statusCode, response.headers, response);
            res.end(responseBody);

            const responseToCache = JSON.stringify({
              status: response.statusCode,
              headers: response.headers,
              body: responseBody
            });

            fs.writeFile(fileCache, responseToCache, a => {
              console.log(`[${new Date().toISOString()}] [${req.method}] response cached for: [${requestBody.slice(0, 30)}]`);
            });
          }
        );
      }
    });
  })
  .listen(config.port);
