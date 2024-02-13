---
title: '@metrics/emitter'
tableOfContents:
  maxHeadingLevel: 4
---

Emitter for sending metrics over a network to a [daemon](../daemon).

## Installation

```bash
$ npm install @metrics/emitter
```

## Example

Set up an emitter which connects to a daemon on UDP on port 6000 and  pipes the metrics from the [`@metrics/client`](https://github.com/metrics-js/client):

```js
const Emitter = require('@metrics/emitter');
const Client = require('@metrics/client');

const emitter = new Emitter('udp', { port: 6000 });
const client = new Client();

client.pipe(emitter);
```

## Description

This module makes it possible stream metrics over a socket to a daemon. The socket can
be of different protocols (UDP, TCP etc) but the data trasmitted over it is expected to be of
the [`@metrics/metric`](https://github.com/metrics-js/metric) type.

For recieving metrics over a socket one are expected to use the [`@metrics/daemon`](https://github.com/metrics-js/daemon) module.

The main purpose of this is to be able to send metrics from multiple processes to a sentral
service (daemon) for further handling. Here is a simplified example of each worker in a
cluster pushing metrics to the master and the master pushing the metric further:

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
in daemon for a full example.

## Constructor

Create a new Emitter instance.

```js
const Emitter = require('@metrics/emitter');
const emitter = new Emitter(transport, options);
```

### transport (required)

What type of transport to use. Supported values are:

 * `udp` - For UDP transport.

### options (optional)

An Object containing misc configuration for the selected transport. Please see each
transport for which option which can be passed in.

### returns

Returns a Writable stream in object mode.

## Transports

The following transports is supported:

### UDP

UDP as a transport can be enabled by providing `udp` to the transport argument on the
Emitter constructor. The UDP transport takes the following options (passed to the options
argument on the Emitter constructor):

 * **port** - `Number` - The port of the daemon. Default: 40400.
 * **address** - `String` - The address of the daemon. Default: localhost.
