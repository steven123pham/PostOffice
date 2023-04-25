const fs = require("fs");			// FileSystem
const http = require("http");
const mime = require("mime-types");
const queryString = require("querystring");
const url = require("url");

const serverConfig = require("./config/server-setup.json");

let apiPaths = {
	"GET": {},
	"POST": {}
}

function addEndpoints(startPath) {
	// Recursively go through the startPath (./api/) directory and
	// create endpoints from javascript files

	// Note: Modules must add security themselves

	const relativePaths = fs.readdirSync("." + startPath);

	for (const relativePath of relativePaths) {
		const itemPath = startPath + relativePath;
		
		fs.stat("." + itemPath, (err, stat) => {
			if (err) {
				// An error occurred reading the file system
				console.log("Error: " + err);
			}
			else {
				// We have access to this item
				// It may be a file or directory (folder)
				if (stat.isDirectory()) {
					// Read this again
					addEndpoints(itemPath + "/");
				}
				else {
					// Add this javascript file as an endpoint
					const mod = require("." + itemPath);
					const endpointPath = itemPath.substring(0, itemPath.indexOf("."))
					
					if (mod.get != null) {
						apiPaths.GET[endpointPath] = mod.get;
					}

					if (mod.post != null) {
						apiPaths.POST[endpointPath] = mod.post;
					}

					/*
					if (mod.put != null) {
						app.put(endpointPath, mod.put);
					}

					if (mod.delete != null) {
						app.delete(endpointPath, mod.delete);
					}
					*/
				}
			}
		})
	}
}

function parseCookies(cookieString) {
	var cookies = {};
	
	cookieString && cookieString.split(';').forEach(function(cookie) {
		var parts = cookie.split('=');
		cookies[parts.shift().trim()] = decodeURI(parts.join('='));
	});

	return cookies;
}

// Then call it
addEndpoints("/api/");

const server = http.createServer(async function(req, res) {
	req.url = req.url.toLowerCase();

	// express replacement
	// replacement for express
	let fakeReq = {
		url: req.url,
		headers: req.headers,
		cookies: parseCookies(req.headers.cookie)
	};
	let fakeRes = {
		send: function(data) {
			const dataType = typeof data;
			if (dataType == "object") {
				res.writeHead(200, {"Content-Type": "application/json"});
				res.end(JSON.stringify(data));
				return;
			}
			else if (dataType == "string") {
				res.writeHead(200, {"Content-Type": "text/plain"});
				res.end(data);
				return;
			}
		}
	};

	if (req.url.indexOf("/api/") == 0) {
		// Catching errors when doing requests incorrectly
		if (apiPaths[req.method] == null || apiPaths[req.method][req.url] == null) {
			fakeRes.send({
				success: false,
				message: `[API] Method '${req.method}' does exist at '${req.url}'. Check your spelling and method. (Usually you POST to send data).`
			});
			return;
		}
		
		if (req.method == "POST") {
			let body = "";
			
			req.on("data", function(data) {
				body += data;
			});
			
			req.on("end", async function() {
				fakeReq.body = JSON.parse(body);
				
				if (apiPaths.POST[req.url] != null) {
					try {
						await apiPaths.POST[req.url](fakeReq, fakeRes);
					}
					catch (exception) {
						console.log(exception);
						fakeRes.send({
							success: false,
							message: "Your input is invalid"
						});
					}
				}
				else {
					fakeRes.send({
						success: false,
						message: `[API] Invalid POST on path: ${req.url} (Make sure your path is correct.)`
					});
				}
			});
		}
		else {
			await apiPaths.GET[req.url](fakeReq, fakeRes);
		}
		return;
	}
	else {
		// This is a static site
		if (req.method != "GET") {
			fakeRes.send({
				success: false,
				message: `Invalid method ${req.method} on path ${req.url}`
			});
			return;
		}
		if (req.url == "/") {
			req.url = "/index.html";
		}

		const filePath = process.cwd() + "/www" + req.url;

		if (!fs.existsSync(filePath)) {
			// File does not exist on the server
			fakeRes.send({
				success: false,
				message: `[WWW] File does not exist: ${req.url} (Are you doing an API request?)`
			});
			return;
		}

		const fileExtension = filePath.substring(filePath.lastIndexOf(".") + 1);
		const contentType = mime.lookup(fileExtension) || 'application/octet-stream';

		res.writeHead(200, {"Content-Type": contentType});
		fs.createReadStream(filePath).pipe(res);
	}
});

server.listen(serverConfig.port);
console.log("Listening...");
