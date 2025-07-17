# Contributing

Your contributions are very welcome! Whether you:

* [report bugs](https://github.com/ham-js/cat/issues/new?template=bug_report.md)
* [request features](https://github.com/ham-js/cat/issues/new?template=feature_request.md)
* or [contribute documentation or code](https://github.com/ham-js/cat/compare)

we are happy for your help!

The following documents outlines common tasks and explains assumptions and inner workings of `@ham-js/cat`.

## Dependencies

We heavily use [zod](https://zod.dev/) for input validations and
[rxjs](http://rxjs.dev/) for dealing with data, events and more.

## Architecture

At the moment `@ham-js/cat` is divided into two parts:

* drivers
* and devices

**Drivers** are responsible for **communication with a physical device**. They can
be **opened/closed** and you can **write data** through them. Drivers conventiently
allow you to *send and read strings* as well.

**Devices** are the **interface to physical devices**. There are subclasses which
group common methods for specific accessories, *such as transceivers.*

## Drivers

The interface for a driver is fairly simple:

* There is a `type` which allows introspection and validation at runtime: Not every device supports every `DriverType`
* `data` allows devices to read data from this driver, such as messages from a websocket, bytes from a serial port or other types of data. **Note::** This is usually the **raw** data. You might need to parse several emissions from the data observable into meaningful messages yourself (e.g. via a `delimiterParser`).
* `stringData` uses a [`TextDecoder`](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder) to return strings instead of bytes
* `write` allows devices to write bytes to this driver (or you can use the convenience method `writeString`)
* `open/close` and `isClose` are used by devices to ensure the proper state of the driver for reading/writing

## Devices

A device implements a rich interface for supporting common features of physical devices:

* `deviceName`, `deviceType`, `deviceVendor` and `displayName` allow introspection at runtime and enable building rich configuration dialogs without hardcoding specific devices
* `events` allow subscribing to devices which emit events when their state changes (e.g. when you turn the VFO knob on a transceiver) - transceivers which don't support this implement a polling mechanism for basic changes
* `deviceSchema` - Devices always receive **at least one parameter** when constructed: **The driver used to communicate with a real device**. Some devices need an additional **second parameter** which is **always an object**. This method allows you to query the **shape of that parameter as JSON schema** e.g. to build configuration dialogs. An example are ICOM devices which need to be configured with a device and controller address.
* `driverLog` and `deviceLog` emit logging information when logging was enabled when `open` was called on the device
* `open`/`close` and `isOpen` handle the state of a device when calling commands or reading events.
* `getCommandSchema` and `getCommands` allow for introspection of available commands.

### Commands

Methods that interface a real physical device are called **commands**. They usually write to the physical device through the **driver** and read data from it as well.

In order to allow validation and introspection there is a method decorator `@command`.

```typescript
@command({
  frequency: z.number().min(30_000).max(54_000_000) // this is a zod schema!
})
setVFOFrequency({ frequency }: { frequency: number }) { 
  // ...
}
```

As you can see here typescript types might be insufficient for describing
allowed input values at build time.  When a command is called the input
parameter (which is either undefined or an object) is parsed using zod and an
exception thrown if the input is invalid.

Furthermore the decorator ensures only one command can be called at the same
time (locking mechanism). This is that commands don't interfere with each other.

### Device Schemas

Similarly to `@command` there exists an (optional) decorator called `@device` that is called with a schema describing the *second, optional* parameter a device constructor receives.

```typescript
@device({
  deviceAddress: z.number().min(0).max(0x5F)
})
class MyTrx extends Device {
  // ...
}
```

If the decorator is called on a device class upon constructing an object of that
class the second parameter is parsed using zod. If it is invalid an exception is
thrown.

### Supported Drivers

To support introspection there is another class decorator called
`@supportedDrivers`. This decorator is called with an array of `DriverType`s so
we can enumerate drivers at runtime.

```typescript
@supportedDrivers([DriverType.WebSocketDriver])
class RemoteDevice extends Device {
  // ...
}
```

### Data Type/`readResponse`

The Device class is generic. It has one type parameter called `DataType`.

It is very common to:

* write some data to a driver
* read back the response from the driver.

This is what the protected method `readResponse` is there for. It conveniently
implements a timeout as well, in case the driver does not read back data. In
order to support string and byte commands the `DataType` type parameter is used.

## Common Tasks

**Note:** `@ham-js/cat` relies on automated tests. Please always add tests for your pull requests.

You can run the test suite (minus e2e tests) by running

```bash
yarn test
```

### Adding new devices

If you found that your device is not yet implemented in `@ham-js/cat` you can implement it yourself!

1. If your device is a transceiver use the `Transceiver` class and start there,
if not you might want to open a discussion on GitHub around **adding a new
subclass for a different group of accessories** (such as antennas).
2. Implement the `deviceVendor` and `deviceName` properties. If the vendor of
the transceiver you are implementing is not part of the `DeviceVendor` enum,
simply add it.
3. Describe the transceiver using `@supportedDrivers` (usually required) and `@device` (optional).
4. Implement transceiver commands and don't forget to use the `@command` decorator.
5. Implement `events` if your device supports them.

#### Pitfalls

* **My device's command is incompatible with the method signature of a command in `Transceiver`**

  There are two possible solutions: 
    1. **Choose another method name and call that method from the method with the
    originally compatible method signature.** This often happens if devices allow
    for *more granular command parameters*, e.g. some devices allow to copy band
    settings not only between VFOs but also memory locations.
    2. **Extend the signature in the base class**, so it becomes compatible. We try
    to keep these methods *as general as possible*, so it would be good to make a
    point about changing the signature in your PR description.
  
* I think a method is missing in `Transceiver`

  **Add it!**

### Adding new drivers

If you want to add a driver you can either do it in your own project or - if the driver might be useful
for others as well directly in `@ham-js/cat`.

1. Extend the `Driver` class (or a subclass of it if applicable, e.g. `WebUSBDriver`) and add a new `DriverType` for your driver.
2. Implement the `type` property and add your driver to all devices which might support it by adding your `DriverType` to the `supportedDrivers` array.
3. Also add your driver to the arrays in `src/drivers/index.ts` e.g. for device-agnostic drivers.
4. Implement the `data` property which is the main way for your driver to read back data.
5. Implement the `write` property which is the main way for your driver to write data.
6. Optionally override `isOpen`, `open` and `close`.

Note: If your driver allows writing strings, but the encoding is not UTF-8, you can override the string handling methods/properties `writeString` and `stringData`.

## End-to-end tests

There is a end-to-end test suite for transceivers which run against real
physical devices, connected to your computer. Currently they are limited to
simple devices which don't rely on the second device parameter.

You can run the end-to-end test suite against your device by running

```bash
yarn test:e2e:transceiver
```

The test command is interactive and always runs on node using a serial port (not in the browser).
