---
title: '@metrics/daemon'
tableOfContents:
  maxHeadingLevel: 4
---

This module makes it possible to create a socket you can recieve metrics over. The socket can
be of different protocols (UDP, TCP etc) but the data trasmitted over it is expected to be of
the [`@metrics/metric`](../metric) type. The recieved metrics can
be piped to other metric modules for further handling.

For sending metrics over a socket you are expected to use the [`@metrics/emitter`](../emitter) module.

The main purpose of this is to be able to collect metrics from multiple processes.

## Usage

```bash
npm install @metrics/daemon
```

Set up a daemon with UDP on port 6000 as transport and pipes the incomming metrics into the [`@metrics/client`](https://github.com/metrics-js/client):

```js
const Daemon = require('@metrics/daemon');
const Client = require('@metrics/client');

const daemon = new Daemon('udp', { port: 6000 });
const client = new Client();

daemon.pipe(client);

daemon.listen();
```

Here is a simplified example of each worker in a cluster pushing metrics to the master and the master pushing the metric further:

```js
const master = () => {
    const daemon = new Daemon('udp', { port: 6000 });
    const client = new Client();

    daemon.pipe(client);

    daemon.listen();
};

const worker = () => {
    const emitter = new Emitter('udp', { port: 6000 });
    const client = new Client();

    client.pipe(emitter);

    client.metric({
        name: `worker_${cluster.worker.id}`,
        description: `Worker number: ${cluster.worker.id}`,
        value: 1,
    });
};

const workers = [];

if (cluster.isMaster) {
    for (let i = 0; i < (os.cpus().length - 1); i++) {
        workers.push(cluster.fork());
    }
    master();
}

if (cluster.isWorker) {
    worker();
}
```

See the [cluster example](https://github.com/metrics-js/daemon/tree/master/example/cluster.js)
in examples for a full example.

## API


### constructor(options)

Create a new Daemon instance.

```js
const Daemon = require('@metrics/daemon');
const daemon = new Daemon(transport, options);
```

#### transport (required)

What type of transport to use. Supported values are:

 * `udp` - For UDP transport.

#### options (optional)

An Object containing misc configuration for the selected transport. Please see each transport for which option which can be passed in.

#### returns

Returns a Readable stream in object mode.

The Daemon instance has the following API:

### instance methods

#### .listen()

Starts the daemon with the selected transport.

## Transports

The following transports is supported:

### UDP

UDP as a transport can be enabled by providing `udp` to the transport argument on the
Daemon constructor. The UDP transport takes the following options (passed to the options
argument on the Daemon constructor):

 * **port** - `Number` - The port to bind to. Default: 40400.
 * **address** - `String` - The address to bind to. Default: localhost.
 * **logger** - `Function` - Any logger that implements the methods `trace`, `debug`, `info`, `warn`, `error` and `fatal`. Under the hood [abslog](https://www.npmjs.com/package/abslog) is used. See that module for further information. If no logger is passed in, nothing will be logged.
