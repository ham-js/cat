# Glossary

## Command

A command is a string that can be send to a device. Example: `FA014250000;`.

## Command Factory

A command factory is a function that gets called with exactly one parameter, the
parameter object and returns a string (command).

Furthermore a command factory has another property which describes the type of
the parameter at runtime (see "Parameter Type").

## Command Key

A command key is the "name" of a command factory within devices that implement
them, e.g. `setVFO`.

## Device

A device is a class that implements command factories and holds some static
information such as the device name (e.g. "FT-891"), device vendor (e.g.
"Yaesu") and device type (e.g. "Transceiver")

There are subclasses to categories devices e.g. `TransceiverDevice` and
`YaesuTransceiverDevice` (which is a subclass of `TransceiverDevice`).

# Driver

We call several things a "driver":

* **Device driver** - classes that specifically know how to handle
  communication with a real device through an abstract channel (e.g. a driver
  for the Yaesu FT-891 knows it needs to send `FA;` and then listen for
  `FA....;` coming from the device when you ask it for the frequency of VFO A)
* **Communication driver** - mostly runtime-dependent drivers for actually
  communicating through some kind of connection (whether that is a serial port on
  your computer, a websocket, a HTTP API, WebUSB, ...).

## Parameter Type

A parameter type is a way for a command factory to validate the parameter at
runtime. While we use TypeScript for development, we sometimes need to narrow
types down even more. Consider for example a frequency which is a `number`, yet
`-123` is not a valid frequency. We currently internally use [`zod`](https://github.com/colinhacks/zod).
