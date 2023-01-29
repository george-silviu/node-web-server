Building a WEB server with NodeJS.

- The server handles only GET requests from the client.
- The server records in log files the requests that are made and the errors that may appear on the server.
- Content types that can be served:

  - html
  - css
  - javascript
  - images
  - text
  - json

- Accessible routes on local machine at port 3333:
- http://localhost:3333/ OR http://localhost:3333 - home page
- http://localhost:3333/new-page
- http://localhost:3333/data/data.txt
- http://localhost:3333/data/data.json
- http://localhost:3333/old-page - redirects to new-page
- http://localhost:3333/www-page - redirects to root page (index.html)
- http://localhost:3333/some-random-page - redirects to 404.html
