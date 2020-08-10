# GraphQL Proxy Cache
Simple proxy server to cache the responses of a GraphQL server.
All requests will be stored in files inside a directory.


## Instalation
After cloning this repository, install the dependencies (make sure that you have the node and npm installed):

```
npm install
```


## Setup
In the `config.json` file you could set:
 - port:  the port where the proxy server will run;
 - server_uri: the URI of the GraphQL server that you want to cache. Remember to fill the URI with its protocol, hostname, and path.
 - cache_dir: the directory where the cached responses will be stored

## Run
Just type `npm start` to start the proxy server.

## How to use
You need to replace the original URI by `http://127.0.0.1:<config.port>` where you want to use the proxy cache.


## Clean the cache
For now, the unique way to clean the cache is deleting the cache files manually.