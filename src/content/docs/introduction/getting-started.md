---
title: Getting started
---

Metrics JS is an open source project for isolated instrumentation of independent modules. You can measure the things you feel are important, such as:

- The time it takes to complete an operation.
- The number of incoming requests.
- The CPU load on the server.

Let's go through an example where we produce and read some metrics.

## Install dependencies

First, install these packages:

```bash
npm install @metrics/client \
  @metrics/guard \
  @metrics/prometheus-consumer \
  prom-client
```

MetricsJS consists of three main parts:

1. A [client](../../reference/client/), which is the interface to produce metrics.
2. A [guard](../../reference/guard/), which helps avoid excessive metric permutation creation in a stream.
3. A [consumer](../../reference/prometheus-consumer/), which takes one or more metrics streams and sends data to a service such as Prometheus.

The consumer and guard is something you typically set up once in the root of your application, while the client is used throughout your codebase (or that of your dependencies).

## Generate metrics

The client supports 4 types of metric creation use cases:

1. [Counters](../../reference/client#counter)
2. [Gauges](../../reference/client#gauge)
3. [Histograms](../../reference/client#histogram)
4. [Summaries](../../reference/client#summary)

For instance, to create a counter:

```js
import Client from "@metrics/client";

const client = new Client();

const counter = client.counter({
    name: 'my_counter',
    description: 'What is being counted',
});

counter.inc();
```

See the [client reference](../../reference/client/) for API documentation and more examples.

## Create a consumer

Create a Prometheus consumer singleton in the root of your application, and add a guard:

```js
import Client from "@metrics/client";
import Guard from "@metrics/guard";
import PrometheusConsumer from "@metrics/prometheus-consumer";
import prometheusClient from "prom-client";

const consumer = new PrometheusConsumer({ client: prometheusClient });
const guard = new Guard(consumer);

guard.on('warn', (info) => {
    console.log(`WARN: ${info} is creating a growing number of permutations`);
});

guard.on('drop', (metric) => {
    console.log(`CRITICAL: ${metric.name} has created to many permutations. Metric is dropped.`);
});
```

## Pipe client data to the consumer

MetricsJS works on streams, so you need to pipe the client data to the consumer:

```js
import Client from "@metrics/client";

const clientOne = new Client();
const clientTwo = new Client();

clientOne.pipe(guard).pipe(consumer);
clientTwo.pipe(guard).pipe(consumer);
```

Any number of streams can be piped to the consumer. In other words:

- You can have multiple clients in your application.
- Your dependencies can expose MetricsJS clients.

See the [client reference](../../reference/client/#composing-metric-streams) for code examples.

## Read the metrics

Finally, expose the metrics on an endpoint:

```js
app.get('/metrics', (req, res) => {
    res.set('Content-Type', metricsConsumer.contentType()).send(
        metricsConsumer.metrics(),
    );
});
```

This endpoint can be scraped by Prometheus.
