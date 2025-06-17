<div align="center">
  <a href="https://github.com/ham-js/cat">
    <img src="https://raw.githubusercontent.com/ham-js/cat/initial-setup/docs/static/img/logo.png" alt="Logo" width="128" height="128" />
  </a>

<h3 align="center">@ham-js/cat</h3>

  <p align="center">
    A JavaScript library for all things related to computer aided transceivers.
    <br />
    <a href="https://ham-js.github.io/cat"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://ham-js.github.io/cat">View Demo</a>
    &middot;
    <a href="https://github.com/ham-js/cat/issues/new?template=bug_report.md">Report Bug</a>
    &middot;
    <a href="https://github.com/ham-js/cat/issues/new?template=feature_request.md">Request Feature</a>
  </p>
</div>

ADD BADGES

# Examples

## Create a command for the Yaesu FT-891

## Create a generic serial port

## Send a command via WebUSB

## Send a command via Node SerialPort

## Run the end-to-end test suite against your device

# Features

* *interface* transceivers, antennas and other devices
* send commands via so called *drivers* that you decide what they actually are (e.g. can be a COM port, a websocket for remote stations or something else)
* send commands via *webserial* (possibly a driver on the host necessary) or our *webusb drivers* (no driver on the host necessary)
* (mostly) *platform-agnostic*

And also:

* *generic interfaces to cat accessories* - e.g. your software doesn't need to know about which transceiver it actually interfaces for some common operations
* *specific interfaces to cat accessories* - e.g. if your transceiver supports specific parameters for common commands, you can still use them
* *type-safety at build-time* - `@ham-js/cat` is written in typescript which makes it easier to catch some types of bugs at build time
* *introspection* - you can query the exact shape of e.g. command parameters at runtime to support building dynamic interfaces for specific transceivers. Or you can query all devices by name and type that we support
* *type-safety at runtime* - we validate inputs according to schemas so that we can catch erroneous input at runtime

# E2E Tests

We provide an automated end-to-end test suite that can run real commands against physical devices.

**Warning:** You need to connect a **DUMMY LOAD** in order to run these safely.

## via the browser

Go to [https://ham-js.github.io/cat].

## via Node

```bash
yarn run test:e2e
```

# Contributing

Please refer to [https://ham-js.github.io/cat] in order to understand how the library works.

# Contributors

<a href="https://github.com/ham-js/cat/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ham-js/cat" />
</a>

Made with [contrib.rocks](https://contrib.rocks).
