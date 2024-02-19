---
title: '@metrics/process'
tableOfContents:
  maxHeadingLevel: 4
---

This module collects different process and system metrics on a scheduled frequency. The module is
a readable stream which each metrics is emitted on as an metric object on each schedule.

The stream of metrics can be piped into ex the [@metrics/client](https://github.com/metrics-js/client)
or the [@metrics/emitter](https://github.com/metrics-js/emitter) for further distribution.

Each metric is collected by a collector. Most collectors will provide metrics on each scheduled
run or when the underlaying feature for generating the metric emits to build the metric out of,
but some metrics will only run once due to its nature. Some metrics will not be collected on
some operating systems. Please see [collectors](#collectors) for further detail.

The internal scheduler is a defered interval which prevents kicking off the collection of a new
set of metrics before any previous collection of metrics has finished. This prevents duplicate
metrics and possible memory leaks if any of the async operations of collecting the metrics get
stale for some weird reason.

The scheduler is by default [unrefered](https://nodejs.org/en/docs/guides/timers-in-node/) so
it will not hold up your Node.js process.


## Usage

```bash
npm install @metrics/process
```

Gathering metrics on the process.

```js
const Process = require('@metrics/process');
const Client = require('@metrics/client');
const Emitter = require('@metrics/emitter');

const proc = new Process();
const client = new Client();
const emitter = new Emitter('udp', { port: 45000 });

proc.pipe(client).pipe(emitter);

proc.start();
```

## API


### constructor(options)

Create a new Process instance.

```js
const Process = require('@metrics/process');
const proc = new Process(options);
```

#### options (optional)

An Object containing misc configuration. The following values can be provided:

 * **interval** - `Number` - Time between each collection of process metrics in milliseconds. Default: 10000ms.
 * **prefix** - `String` - A prefix to be added to each metrics name.

#### returns

Returns a Readable stream in object mode.

### Instance methods

The Process instance has the following API:

#### .start(options)

Starts the scheduling of metric collection. The first run of metric collection will run immediately
upon calling this method.

##### options (optional)

An Object containing misc configuration. The following values can be provided:

 * **gc** - `Boolean` - Turns collection of gc metrics on or off. Default: false.

#### .stop()

Stops the scheduling of metric collection. Calling this method will not break the stream pipeline.

### Instance events

An instance of the object will emit the following events:

#### drop

Emitted when the process is dropping metrics. Will emit the dropped metric.

_Example_

```js
const process = new Process();
process.on('drop', metric => {
    console.log('dropped metric', metric);
});
```

#### collect:start

Emitted when the process starts collecting metrics.

_Example_

```js
const process = new Process();
process.on('collect:start', () => {
    console.log('Started collecting metrics');
});
process.start();
```

#### collect:end

Emitted when the process is done collecting metrics.

_Example_

```js
const process = new Process();
process.on('collect:end', () => {
    console.log('Ended collecting metrics');
});
process.start();
```

## Collectors

These are the following metrics collected by this module:

### Version

The Version collector emits a metric with the node.js version used to run the process.

 * **metric name:** nodejs_version_info
 * **collected when:** Only once
 * **collected on:** All operating systems

### V8 heap

The V8 Heap collector emits metrics about the V8 heap spaces.

Metric I:

 * **metric name:** nodejs_heap_space_size_total_bytes
 * **collected when:** On every collect
 * **collected on:** All operating systems

Metric II:

 * **metric name:** nodejs_heap_space_size_used_bytes
 * **collected when:** On every collect
 * **collected on:** All operating systems

Metric III:

 * **metric name:** nodejs_heap_space_size_available_bytes
 * **collected when:** On every collect
 * **collected on:** All operating systems

### Process start time

The Process start time collector emits a metric for when the node.js process started.

 * **metric name:** process_start_time_seconds
 * **collected when:** Only once
 * **collected on:** All operating systems

### Resident memory

The Resident memory collector emits metrics with resident memory in bytes, virtual
memory in bytes and process heap size in bytes.

Metric I:

 * **metric name:** process_resident_memory_bytes
 * **collected when:** On every collect
 * **collected on:** All operating systems

Metric II:

 * **metric name:** process_virtual_memory_bytes
 * **collected when:** On every collect
 * **collected on:** Linux only

Metric III:

 * **metric name:** process_heap_bytes
 * **collected when:** On every collect
 * **collected on:** Linux only

### Open file descriptors

The Open file descriptor collector emits a metric with the number of open file
descriptors.

 * **metric name:** process_open_fds
 * **collected when:** On every collect
 * **collected on:** Linux only

### Max file descriptors

The max file descriptor collector emits a metric with the maximum number of file
descriptors that can be opened.

 * **metric name:** process_max_fds
 * **collected when:** Only once
 * **collected on:** Linux only

### Heap used and size

The Heap used and size collector emits metrics about the memory usage of the Node.js
process.

Metric I:

 * **metric name:** nodejs_heap_size_total_bytes
 * **collected when:** On every collect
 * **collected on:** All operating systems

Metric II:

 * **metric name:** nodejs_heap_size_used_bytes
 * **collected when:** On every collect
 * **collected on:** All operating systems

Metric III:

 * **metric name:** nodejs_external_memory_bytes
 * **collected when:** On every collect
 * **collected on:** All operating systems

### Eventloop lag

The Eventloop lag collector emits a metric with the lag of the eventloop in seconds.

 * **metric name:** nodejs_eventloop_lag_seconds
 * **collected when:** On every collect
 * **collected on:** All operating systems

### CPU total

The CPU total collector emits a metric with the user and system CPU time usage of the
current process. Values are in seconds.

Metric I:

 * **metric name:** process_cpu_user_seconds_total
 * **collected when:** On every collect
 * **collected on:** All operating systems

Metric II:

 * **metric name:** process_cpu_system_seconds_total
 * **collected when:** On every collect
 * **collected on:** All operating systems

Metric III:

 * **metric name:** process_cpu_seconds_total
 * **collected when:** On every collect
 * **collected on:** All operating systems

### Active requests

The Active requests collector emits a metric with the number of open network requests
held by the node.js working queue.

 * **metric name:** nodejs_active_requests_total
 * **collected when:** On every collect
 * **collected on:** All operating systems if `process._getActiveRequests()` is available

### Active handles

The Active handles collector emits a metric with the number of open handles (such as
`setTimeout` etc) held by the node.js working queue.

 * **metric name:** nodejs_active_handles_total
 * **collected when:** On every collect
 * **collected on:** All operating systems if `process._getActiveRequests()` is available

### Garbage collection

The garbage collection (GC) collector emits a metric timing the length of the GC everytime
a GC has run.

Do note that collecting metrics on GC has a performance impact on the system in it self.
Its adviced that collecting GC metrics should be done in moderation and for small periods
of time.

Collecting GC metrics is by default turned off. It can be enabled by the `gc` argument on
the `.start()` method.

 * **metric name:** nodejs_gc_duration_seconds
 * **collected when:** When enabled, every time a GC is done
 * **collected on:** All operating systems


## Examples

### Log the stream to the console

```js
const stream = require('stream');
const Process = require('@metrics/process');

const proc = new Process();

proc.pipe(new stream.Writable({
    objectMode: true,
    write(chunk, encoding, callback) {
        console.log(chunk);
        callback();
    },
}));

proc.start();
```
