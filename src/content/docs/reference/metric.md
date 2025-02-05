---
title: '@metrics/metric'
tableOfContents:
  maxHeadingLevel: 4
---

The metric class definition which metric objects is instansiated from. You'll likely not be using this directly, instead generating metrics with [`@metrics/client`](../client).


All modules in the `@metric` family which exchange data over the `stream` API exchange
this object type. This object definition is intended to be static over time so modules
who depend on a module in the `@metric` family can rely on exchanging data over time.

This class definition is prefered over object literals when exchanging data over the
`stream` API because it will guarantee that all properties are available on the
object. All undefined properties will have a `null` value, making sure they are kept
when serialized to JSON.

The metric object aims to be compatible with the [Open Metrics](https://github.com/OpenObservability/OpenMetrics)
initiative.

## Usage

```bash
npm install @metrics/metric
```

Instantiating a new metric:

```js
const Metric = require('@metrics/metric');

const metric = new Metric({
    name: 'unique_metric_name',
    description: 'Description of metric being collected',
    value: 10,
});
```

## API

### constructor(options)

Create a new Metric instance.

  ```js
 const Metric = require('@metrics/metric');
 const metric = new Metric(options);
 ```

#### options (required)

An object literal reflecting the properties of this class. The following properties
is required:

 * **name** - `String` - The name of the metric.
 * **description** - `String` - The description of the metric.

Each property value is validated and will throw if a property value is found to be invalid.

### instance properties

The instansiated object has the following properties:

#### name

The name of the metric.

 * Valid value: `String` in the range of `[a-zA-Z_][a-zA-Z0-9_]`.
 * Value is immutable.
 * Is required.

#### description

A human readable description of the metric.

 * Valid value: `String`.
 * Value is immutable.
 * Is required.

#### value

The value of the metric.

 * Valid value: `Integer` or `null`.
 * Value is immutable.
 * Defaults to `null`.

#### type

A hint of what type of metric this is.

 * Valid value: `Integer` in the range of `0-7`.
 * Value is immutable.
 * Defaults to `0`.

Each numeric value reflect one of the following types:

 * `0` represents `unknown`.
 * `1` represents `gauge`.
 * `2` represents `counter`.
 * `3` represents `state_set`.
 * `4` represents `info`.
 * `5` represents `cumulative histogram`.
 * `6` represents `gauge histogram`.
 * `7` represents `summary`.

#### source

The source of the metric in terms of where it originated.

 * Valid value: `String` or `null`.
 * Value is mutable.
 * Defaults to `null`.

#### timestamp

A timestamp of when the metric was created.

 * Valid value: `Double` - epoc milliseconds.
 * Value is immutable.
 * Defaults to `Date.now() / 1000`.

#### labels

An `Array` of labeled values. Each item in the `Array` must be a
[`Label`](#label) object.

 * Valid value: `Array` of [`Label`](#label) objects.
 * Value is immutable.
 * Defaults to an empty `Array`.

#### meta

Available to be used to hold any data. The input is not validated.

 * Valid value: `any`.
 * Value is immutable.
 * Default to `null`.

#### time

Is deprecated.

### Label

A `Label` object is a object literal which have the following properties:

#### name

The name of the label.

 * Valid value: `String` must be a valid [Open Observability MetricDescriptor](https://github.com/OpenObservability/OpenMetrics/blob/9a6db2a94dcf8dd84dd08a221e1b323e2b279f08/proto/openmetrics_data_model.proto#L42).
 * Is required.

#### value

The value of the label.

 * Valid value: `Integer`, `String`, `Boolean` or `null`.
 * Is required.

