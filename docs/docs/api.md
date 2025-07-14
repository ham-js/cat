## Classes

<dl>
<dt><a href="#Device">Device</a></dt>
<dd><p>The base class for all devices, holds some information about the device and
provides basic functionality</p></dd>
<dt><a href="#Transceiver">Transceiver</a></dt>
<dd><p>The base transceiver class. Polls for VFO frequencies by default. Subclasses
need to implement VFO get/set commands as that is what defines a
transceiver.</p></dd>
<dt><a href="#Driver">Driver</a></dt>
<dd><p>A driver connects a device to a real physical device. This is the base class for all drivers.</p></dd>
<dt><a href="#WebUSBDriver">WebUSBDriver</a></dt>
<dd><p>Drivers for the <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebUSB_API">WebUSB API</a> supported by chromium based browsers</p></dd>
<dt><a href="#CP210xWebUSBDriver">CP210xWebUSBDriver</a></dt>
<dd><p>A rudimentary WebUSB based driver for CP210x devices by Silicon Labs used
e.g. in some Yaesu transceivers.</p></dd>
<dt><a href="#WebSerialDriver">WebSerialDriver</a></dt>
<dd><p>A <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API">WebSerial</a> based driver for Chromium browsers.</p></dd>
<dt><a href="#DummyDriver">DummyDriver</a></dt>
<dd><p>A dummy driver that never reads any data and that doesn't write anything.</p></dd>
<dt><a href="#LogDriver">LogDriver</a></dt>
<dd><p>An internal driver that wraps another driver and decorates the write
function and data observable to capture logs.</p></dd>
<dt><a href="#SerialPortDriver">SerialPortDriver</a></dt>
<dd><p>A driver for the <a href="https://serialport.io/">Node SerialPort</a> library.</p></dd>
<dt><a href="#WebSocketDriver">WebSocketDriver</a></dt>
<dd><p>A driver that receives data from websockets and writes to websockets as
well.</p></dd>
</dl>

## Members

<dl>
<dt><a href="#DeviceType">DeviceType</a></dt>
<dd><p>The different device types implemented in ham-js, currently only
Transceiver is really in use.</p></dd>
<dt><a href="#AGCAttack">AGCAttack</a></dt>
<dd><p>A value for the AGC attack time.</p></dd>
<dt><a href="#AntennaTunerState">AntennaTunerState</a></dt>
<dd><p>The state of the antenna tuner, can be on/off and tuning.</p></dd>
<dt><a href="#Direction">Direction</a></dt>
<dd><p>A generic direction enum, used e.g. for navigating device menus via commands.</p></dd>
<dt><a href="#TransceiverEventType">TransceiverEventType</a></dt>
<dd><p>The different types of transceiver events</p></dd>
<dt><a href="#TransceiverVendor">TransceiverVendor</a></dt>
<dd><p>The different vendors of transceivers</p></dd>
<dt><a href="#VFOType">VFOType</a></dt>
<dd><p>The different VFO types of transceivers</p></dd>
<dt><a href="#DriverType">DriverType</a></dt>
<dd><p>The different driver types. Every driver class uses its own type. It is
used for introspection and validation of supported drivers on devices at
runtime.</p></dd>
</dl>

## Constants

<dl>
<dt><a href="#Bands">Bands</a></dt>
<dd><p>The amateur radio bands supported by devices.</p></dd>
<dt><a href="#CTCSSFrequencies">CTCSSFrequencies</a></dt>
<dd><p>All available CTCSS frequencies.</p></dd>
</dl>

## Functions

<dl>
<dt><a href="#command">command(schemaShape)</a> ⇒ <code>function</code></dt>
<dd><p>Declare a method on a <code>Device</code> as a command: handles logging, input validation and introspection.</p></dd>
<dt><a href="#device">device(schemaShape)</a> ⇒ <code>object</code></dt>
<dd><p>This decorator is useful for devices which receive a second (object)
parameter when constructed (e.g. ICOM devices need a controller and device
address).</p></dd>
<dt><a href="#supportedDrivers">supportedDrivers(supportedDrivers)</a> ⇒ <code>object</code></dt>
<dd><p>This decorator allows to define the drivers this device supports. For introspection reasons we use an enum here.
If not used the device supports all available drivers. <strong>Hint:</strong> You can use the convenience arrays of drivers, such as <code>DeviceAgnosticDriverTypes</code>.</p></dd>
<dt><a href="#delimiterParser">delimiterParser(source, delimiter)</a> ⇒ <code>Observable</code></dt>
<dd><p>A utility that groups emissions of a source observable which are delimited by a certain delimiter.</p></dd>
<dt><a href="#fromLittleEndianBCD">fromLittleEndianBCD(input)</a> ⇒ <code>number</code></dt>
<dd><p>Convert an input in little endian BCD to number</p></dd>
<dt><a href="#getDigit">getDigit(input, n)</a> ⇒ <code>number</code></dt>
<dd><p>Get the n-th digit of a (integer) number</p></dd>
<dt><a href="#getNumberOfDigits">getNumberOfDigits(input)</a> ⇒ <code>number</code></dt>
<dd><p>Get the number of digits of an integer number</p></dd>
<dt><a href="#padBytesEnd">padBytesEnd(input, length)</a> ⇒ <code>Uint8Array</code></dt>
<dd><p>Pad an input with zero bytes until it reaches a certain length</p></dd>
<dt><a href="#parseResponse">parseResponse(input, parser, formatter, distinctKey)</a> ⇒ <code>Observable</code></dt>
<dd><p>Parses an input observable into some kind of value, formats it iff it's not
null/undefined, optionally only emits distinct elements and sets a timestamp on its emissions.
This is mostly used for device events, e.g. VFO frequency changes coming from a transceiver &quot;event bus&quot;
which potentially contains different events.</p></dd>
<dt><a href="#poll">poll(observableFactory, distinctKey, interval)</a> ⇒ <code>Observable</code></dt>
<dd><p>Polls an observable factory (usually a function returning a promise)
every n ms and emits values including a timestamp <strong>Note</strong>: The
observable returned by this utility wait for calls to the factory to
return. It is not guaranteed to return a value every n ms.</p></dd>
<dt><a href="#toLittleEndianBCD">toLittleEndianBCD(input)</a> ⇒ <code>Uint8Array</code></dt>
<dd><p>Converts an input number to BCD in little endian byte order.</p></dd>
<dt><a href="#invertMap">invertMap(input)</a> ⇒ <code>Map</code></dt>
<dd><p>A type safe utility to invert a JavaScript Map.</p></dd>
<dt><a href="#oneOf">oneOf(ary)</a> ⇒ <code>z.Schema</code></dt>
<dd><p>a zod utility to validate inclusion of a value in an array</p></dd>
</dl>

<a name="Device"></a>

## Device
<p>The base class for all devices, holds some information about the device and
provides basic functionality</p>

**Kind**: global class  

* [Device](#Device)
    * [new Device(driver, parameter)](#new_Device_new)
    * _instance_
        * [.responseTimeout](#Device+responseTimeout)
        * [.data](#Device+data)
        * [.events](#Device+events)
        * [.driverLog](#Device+driverLog) ⇒ <code>Observable</code> \| <code>undefined</code>
        * [.deviceLog](#Device+deviceLog) ⇒ <code>Observable</code> \| <code>undefined</code>
        * [.isOpen](#Device+isOpen) ⇒ <code>boolean</code>
        * [.open(config)](#Device+open)
        * [.close()](#Device+close)
        * [.getCommandSchema(command)](#Device+getCommandSchema) ⇒ <code>object</code>
        * [.getCommands()](#Device+getCommands) ⇒ <code>Array.&lt;string&gt;</code>
        * [.readResponse(command, mapFn, responseTimeout)](#Device+readResponse) ⇒ <code>Promise</code>
    * _static_
        * [.deviceSchema](#Device.deviceSchema) ⇒ <code>object</code>
        * [.displayName](#Device.displayName) ⇒ <code>string</code>
        * [.supportedDrivers](#Device.supportedDrivers) ⇒ [<code>Array.&lt;DriverType&gt;</code>](#DriverType)

<a name="new_Device_new"></a>

### new Device(driver, parameter)
<p>The constructor for devices, which always (also in subclasses) takes this
shape to allow for introspection and type-safety at runtime and
buildtime.</p>


| Param | Type | Description |
| --- | --- | --- |
| driver | [<code>Driver</code>](#Driver) | <p>The driver this device uses to communicate with a real physical device.</p> |
| parameter | <code>object</code> | <p>Optional additional parameters this device needs to function properly, such as target device addresses etc.. This is described using the <code>@device</code> decorater and can be introspected at runtime using <code>deviceSchema</code>.</p> |

<a name="Device+responseTimeout"></a>

### device.responseTimeout
<p>The response timeout used by <code>readResponse</code></p>

**Kind**: instance property of [<code>Device</code>](#Device)  
<a name="Device+data"></a>

### device.data
<p>The optional device data from which <code>readResponse</code> reads after writing a
command to the driver.</p>

**Kind**: instance property of [<code>Device</code>](#Device)  
<a name="Device+events"></a>

### device.events
<p>The optional events coming from a device (such as Yaesu TRX which have
&quot;Auto Information&quot; which automatically sends data to the computer when
anything changes).</p>

**Kind**: instance property of [<code>Device</code>](#Device)  
<a name="Device+driverLog"></a>

### device.driverLog ⇒ <code>Observable</code> \| <code>undefined</code>
<p>When a device is opened with <code>logDriver: true</code> this returns the driver log.</p>

**Kind**: instance property of [<code>Device</code>](#Device)  
**Returns**: <code>Observable</code> \| <code>undefined</code> - <p>the driver log which contains all
messages written through the driver to a real physical device</p>  
<a name="Device+deviceLog"></a>

### device.deviceLog ⇒ <code>Observable</code> \| <code>undefined</code>
<p>When a device is opened with <code>logDevice: true</code> this returns the device log.</p>

**Kind**: instance property of [<code>Device</code>](#Device)  
**Returns**: <code>Observable</code> \| <code>undefined</code> - <p>the device log which contains all
calls to commands and their parameters and timestamps.</p>  
<a name="Device+isOpen"></a>

### device.isOpen ⇒ <code>boolean</code>
<p>Whether the device is open. By default this delegates to the driver.</p>

**Kind**: instance property of [<code>Device</code>](#Device)  
**Returns**: <code>boolean</code> - <p>Whether this device is open for calling commands.</p>  
<a name="Device+open"></a>

### device.open(config)
<p>Open the device for executing commands, reading data and subscribing to
events. By defaults this delegates to the driver and handles setting up
logging.</p>

**Kind**: instance method of [<code>Device</code>](#Device)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | <p>the open configuration</p> |
| config.logDriver | <code>boolean</code> | <p>Whether the device should log driver calls</p> |
| config.logDevice | <code>boolean</code> | <p>Whether the device should log command calls</p> |
| config.log | <code>boolean</code> | <p>Whether the device should log both</p> |

<a name="Device+close"></a>

### device.close()
<p>Close the device for executing commands, reading data and subscribing to events.</p>

**Kind**: instance method of [<code>Device</code>](#Device)  
<a name="Device+getCommandSchema"></a>

### device.getCommandSchema(command) ⇒ <code>object</code>
<p>Get the command schema for a given command</p>

**Kind**: instance method of [<code>Device</code>](#Device)  
**Returns**: <code>object</code> - <p>The JSON schema describing the object parameter for that command</p>  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>string</code> | <p>the key of a command method</p> |

<a name="Device+getCommands"></a>

### device.getCommands() ⇒ <code>Array.&lt;string&gt;</code>
<p>Get all keys of implemented commands.</p>

**Kind**: instance method of [<code>Device</code>](#Device)  
**Returns**: <code>Array.&lt;string&gt;</code> - <p>An array containing all the keys of commands this device implements.</p>  
<a name="Device+readResponse"></a>

### device.readResponse(command, mapFn, responseTimeout) ⇒ <code>Promise</code>
<p>Convenience method to write a command and wait for a specific response
from the real physical device. Handles timeouts as well. Needs the <code>data</code>
property and <code>DataType</code> type parameter to be defined.</p>

**Kind**: instance method of [<code>Device</code>](#Device)  
**Returns**: <code>Promise</code> - <p>A promise that resolves with the first value the mapFn
returns that is not null/undefined and rejects when a timeout happens.</p>  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>Uint8Array</code> \| <code>string</code> | <p>the command to write</p> |
| mapFn | <code>function</code> | <p>A function which is called with responses after the command was written. Should return null or undefined for responses that are not of interest.</p> |
| responseTimeout | <code>number</code> | <p>An optional response timeout in ms, overrides the <code>responseTimeout</code> defined on the device.</p> |

<a name="Device.deviceSchema"></a>

### Device.deviceSchema ⇒ <code>object</code>
<p>The optional device schema of the device. This is used for devices which
need additional parameters to be instantiated, such as the
controller/device address in the case of ICOM devices.</p>

**Kind**: static property of [<code>Device</code>](#Device)  
**Returns**: <code>object</code> - <p>The JSON schema describing the second parameter to the
constructor.</p>  
<a name="Device.displayName"></a>

### Device.displayName ⇒ <code>string</code>
<p>Convenience method to get the display name of the device.</p>

**Kind**: static property of [<code>Device</code>](#Device)  
**Returns**: <code>string</code> - <p>the concatenated device vendor and device name</p>  
<a name="Device.supportedDrivers"></a>

### Device.supportedDrivers ⇒ [<code>Array.&lt;DriverType&gt;</code>](#DriverType)
<p>Get the supported driver (types) of the device, default is all members of DriverType.</p>

**Kind**: static property of [<code>Device</code>](#Device)  
**Returns**: [<code>Array.&lt;DriverType&gt;</code>](#DriverType) - <p>An array of driver types this device supports
(trying to instantiate a device with a non-supported driver results in an
error).</p>  
<a name="Transceiver"></a>

## Transceiver
<p>The base transceiver class. Polls for VFO frequencies by default. Subclasses
need to implement VFO get/set commands as that is what defines a
transceiver.</p>

**Kind**: global class  

* [Transceiver](#Transceiver)
    * [.getVFOFrequency(parameter)](#Transceiver+getVFOFrequency) ⇒ <code>Promise.&lt;number&gt;</code>
    * [.setVFOFrequency(parameter)](#Transceiver+setVFOFrequency)

<a name="Transceiver+getVFOFrequency"></a>

### transceiver.getVFOFrequency(parameter) ⇒ <code>Promise.&lt;number&gt;</code>
<p>Get the frequency of the specified VFO.</p>

**Kind**: instance method of [<code>Transceiver</code>](#Transceiver)  
**Returns**: <code>Promise.&lt;number&gt;</code> - <p>A promise resolving to the frequency of the specified VFO</p>  

| Param | Type | Description |
| --- | --- | --- |
| parameter | <code>object</code> | <p>The vfo configuration which which to return the frequency</p> |
| parameter.vfo | [<code>VFOType</code>](#VFOType) | <p>The vfo for which to return the frequency</p> |

<a name="Transceiver+setVFOFrequency"></a>

### transceiver.setVFOFrequency(parameter)
<p>Set the frequency of the specified VFO.</p>

**Kind**: instance method of [<code>Transceiver</code>](#Transceiver)  

| Param | Type | Description |
| --- | --- | --- |
| parameter | <code>object</code> | <p>The vfo configuration which which to set the frequency</p> |
| parameter.vfo | [<code>VFOType</code>](#VFOType) | <p>The vfo for which to set the frequency</p> |
| parameter.frequency | <code>number</code> | <p>The frequency to which to set the VFO</p> |

<a name="Driver"></a>

## Driver
<p>A driver connects a device to a real physical device. This is the base class for all drivers.</p>

**Kind**: global class  

* [Driver](#Driver)
    * [.textEncoder](#Driver+textEncoder)
    * [.isOpen](#Driver+isOpen) ⇒ <code>boolean</code>
    * [.stringData(encoding, options)](#Driver+stringData) ⇒ <code>Observable.&lt;string&gt;</code>
    * [.writeString(data)](#Driver+writeString) ⇒ <code>void</code> \| <code>Promise.&lt;void&gt;</code>

<a name="Driver+textEncoder"></a>

### driver.textEncoder
<p>The default text encoder of the driver. Overwrite this for custom string
encodings.</p>

**Kind**: instance property of [<code>Driver</code>](#Driver)  
<a name="Driver+isOpen"></a>

### driver.isOpen ⇒ <code>boolean</code>
<p>Returns whether the driver is open for reading and writing.</p>

**Kind**: instance property of [<code>Driver</code>](#Driver)  
**Returns**: <code>boolean</code> - <p>Whether this driver is open</p>  
<a name="Driver+stringData"></a>

### driver.stringData(encoding, options) ⇒ <code>Observable.&lt;string&gt;</code>
<p>Get the data of the driver as utf-8 observable.</p>

**Kind**: instance method of [<code>Driver</code>](#Driver)  
**Returns**: <code>Observable.&lt;string&gt;</code> - <p>An observable of strings based on the Uint8Array-based <code>data</code> property</p>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| encoding | <code>string</code> | <code>&quot;utf-8&quot;</code> | <p>The encoding of the text decoder used on emissions of the <code>data</code> property</p> |
| options | <code>object</code> |  | <p>Options for the text decoder</p> |

<a name="Driver+writeString"></a>

### driver.writeString(data) ⇒ <code>void</code> \| <code>Promise.&lt;void&gt;</code>
<p>Convenience method to write strings instead of bytes to the real physical device.
This method uses the protected <code>textEncoder</code> property to encode the input string to bytes.</p>

**Kind**: instance method of [<code>Driver</code>](#Driver)  
**Returns**: <code>void</code> \| <code>Promise.&lt;void&gt;</code> - <p>A promise that resolves after the data was
written, or void if the <code>write</code> method doesn't return a promise</p>  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>string</code> | <p>The data to write</p> |

<a name="WebUSBDriver"></a>

## WebUSBDriver
<p>Drivers for the <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebUSB_API">WebUSB API</a> supported by chromium based browsers</p>

**Kind**: global class  
<a name="WebUSBDriver+deviceFilters"></a>

### webUSBDriver.deviceFilters
<p>The device filters supported by this driver. Can be handed directly to
<a href="https://developer.mozilla.org/en-US/docs/Web/API/USB/requestDevice">requestDevice</a>
in order to only show supported devices.</p>

**Kind**: instance property of [<code>WebUSBDriver</code>](#WebUSBDriver)  
<a name="CP210xWebUSBDriver"></a>

## CP210xWebUSBDriver
<p>A rudimentary WebUSB based driver for CP210x devices by Silicon Labs used
e.g. in some Yaesu transceivers.</p>

**Kind**: global class  
<a name="WebSerialDriver"></a>

## WebSerialDriver
<p>A <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API">WebSerial</a> based driver for Chromium browsers.</p>

**Kind**: global class  
<a name="new_WebSerialDriver_new"></a>

### new WebSerialDriver(serialPort, options)
<p>The constructor for the web serial driver</p>


| Param | Type | Description |
| --- | --- | --- |
| serialPort | <code>object</code> | <p>a serial port returned by <a href="https://developer.mozilla.org/en-US/docs/Web/API/Serial/requestPort">requestPort</a></p> |
| options | <code>object</code> | <p>Options used for <a href="https://developer.mozilla.org/en-US/docs/Web/API/SerialPort/open">opening</a> the serial port (such as <code>baudRate</code>)</p> |

<a name="DummyDriver"></a>

## DummyDriver
<p>A dummy driver that never reads any data and that doesn't write anything.</p>

**Kind**: global class  
<a name="LogDriver"></a>

## LogDriver
<p>An internal driver that wraps another driver and decorates the write
function and data observable to capture logs.</p>

**Kind**: global class  
<a name="SerialPortDriver"></a>

## SerialPortDriver
<p>A driver for the <a href="https://serialport.io/">Node SerialPort</a> library.</p>

**Kind**: global class  
<a name="new_SerialPortDriver_new"></a>

### new SerialPortDriver(serialPort, timeout)
<p>The constructor for the node serial port driver. Make sure to hand in a
serial port that is not opened yet and has <code>autoOpen</code> set to <code>false</code>.</p>


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| serialPort | <code>SerialPortStream</code> |  | <p>A not-yet-open serial port (make sure to set <code>autoOpen</code> to <code>false</code>.</p> |
| timeout | <code>number</code> | <code>1000</code> | <p>A timeout used for writing to the serial port</p> |

<a name="WebSocketDriver"></a>

## WebSocketDriver
<p>A driver that receives data from websockets and writes to websockets as
well.</p>

**Kind**: global class  
<a name="DeviceType"></a>

## DeviceType
<p>The different device types implemented in ham-js, currently only
Transceiver is really in use.</p>

**Kind**: global variable  
<a name="AGCAttack"></a>

## AGCAttack
<p>A value for the AGC attack time.</p>

**Kind**: global variable  
<a name="AntennaTunerState"></a>

## AntennaTunerState
<p>The state of the antenna tuner, can be on/off and tuning.</p>

**Kind**: global variable  
<a name="Direction"></a>

## Direction
<p>A generic direction enum, used e.g. for navigating device menus via commands.</p>

**Kind**: global variable  
<a name="TransceiverEventType"></a>

## TransceiverEventType
<p>The different types of transceiver events</p>

**Kind**: global variable  
<a name="TransceiverVendor"></a>

## TransceiverVendor
<p>The different vendors of transceivers</p>

**Kind**: global variable  
<a name="VFOType"></a>

## VFOType
<p>The different VFO types of transceivers</p>

**Kind**: global variable  
<a name="DriverType"></a>

## DriverType
<p>The different driver types. Every driver class uses its own type. It is
used for introspection and validation of supported drivers on devices at
runtime.</p>

**Kind**: global variable  
<a name="Bands"></a>

## Bands
<p>The amateur radio bands supported by devices.</p>

**Kind**: global constant  
<a name="CTCSSFrequencies"></a>

## CTCSSFrequencies
<p>All available CTCSS frequencies.</p>

**Kind**: global constant  
<a name="command"></a>

## command(schemaShape) ⇒ <code>function</code>
<p>Declare a method on a <code>Device</code> as a command: handles logging, input validation and introspection.</p>

**Kind**: global function  
**Returns**: <code>function</code> - <p>The decorated method</p>  

| Param | Type | Description |
| --- | --- | --- |
| schemaShape | <code>object</code> | <p>An object describing a zod schema (not a schema itself, but what you pass to z.object(...))</p> |

<a name="device"></a>

## device(schemaShape) ⇒ <code>object</code>
<p>This decorator is useful for devices which receive a second (object)
parameter when constructed (e.g. ICOM devices need a controller and device
address).</p>

**Kind**: global function  
**Returns**: <code>object</code> - <p>The decorated class</p>  

| Param | Type | Description |
| --- | --- | --- |
| schemaShape | <code>object</code> | <p>An object describing a zod schema (not a schema itself, but what you pass to z.object(...))</p> |

<a name="supportedDrivers"></a>

## supportedDrivers(supportedDrivers) ⇒ <code>object</code>
<p>This decorator allows to define the drivers this device supports. For introspection reasons we use an enum here.
If not used the device supports all available drivers. <strong>Hint:</strong> You can use the convenience arrays of drivers, such as <code>DeviceAgnosticDriverTypes</code>.</p>

**Kind**: global function  
**Returns**: <code>object</code> - <p>the decorated class</p>  

| Param | Type | Description |
| --- | --- | --- |
| supportedDrivers | [<code>Array.&lt;DriverType&gt;</code>](#DriverType) | <p>the supported drivers in form of the DriverType associated with them</p> |

<a name="delimiterParser"></a>

## delimiterParser(source, delimiter) ⇒ <code>Observable</code>
<p>A utility that groups emissions of a source observable which are delimited by a certain delimiter.</p>

**Kind**: global function  
**Returns**: <code>Observable</code> - <p>A new observable which emits parsed emissions of the source observable</p>  

| Param | Type | Description |
| --- | --- | --- |
| source | <code>Observable</code> | <p>The source observable</p> |
| delimiter | <code>string</code> \| <code>number</code> | <p>The delimiter for which the parser looks</p> |

**Example**  
```js
const source = of("F", "A", "14", "350", "000;")
 const parsed = delimiterParser(source, ";")
 parsed.subscribe(console.log) // "FA14350000;"
 
```
<a name="fromLittleEndianBCD"></a>

## fromLittleEndianBCD(input) ⇒ <code>number</code>
<p>Convert an input in little endian BCD to number</p>

**Kind**: global function  
**Returns**: <code>number</code> - <p>The number described by the input data</p>  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>Uint8Array</code> | <p>data formatted in little endian BCD</p> |

<a name="getDigit"></a>

## getDigit(input, n) ⇒ <code>number</code>
<p>Get the n-th digit of a (integer) number</p>

**Kind**: global function  
**Returns**: <code>number</code> - <p>the digit at index n of the input number</p>  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>number</code> | <p>the input number</p> |
| n | <code>number</code> | <p>the index of the digit to return</p> |

<a name="getNumberOfDigits"></a>

## getNumberOfDigits(input) ⇒ <code>number</code>
<p>Get the number of digits of an integer number</p>

**Kind**: global function  
**Returns**: <code>number</code> - <p>The number of digits of the input number</p>  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>number</code> | <p>The input number</p> |

<a name="padBytesEnd"></a>

## padBytesEnd(input, length) ⇒ <code>Uint8Array</code>
<p>Pad an input with zero bytes until it reaches a certain length</p>

**Kind**: global function  
**Returns**: <code>Uint8Array</code> - <p>the input data padded with zero bytes at the end (or the input data itself if it already had the appropriate length)</p>  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>Uint8Array</code> | <p>Input data</p> |
| length | <code>number</code> | <p>the length in bytes the output should be long</p> |

<a name="parseResponse"></a>

## parseResponse(input, parser, formatter, distinctKey) ⇒ <code>Observable</code>
<p>Parses an input observable into some kind of value, formats it iff it's not
null/undefined, optionally only emits distinct elements and sets a timestamp on its emissions.
This is mostly used for device events, e.g. VFO frequency changes coming from a transceiver &quot;event bus&quot;
which potentially contains different events.</p>

**Kind**: global function  
**Returns**: <code>Observable</code> - <p>an observable which emits parsed and formatted values based on the params</p>  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>Observable</code> | <p>an input observable</p> |
| parser | <code>function</code> | <p>a function which takes an emission from the input observable and parses it into something the formatter understands or null/undefined which terminates processing of this event</p> |
| formatter | <code>function</code> | <p>a function which takes in what the parser returned and formats it to be something a consumer understands</p> |
| distinctKey | <code>string</code> | <p>an optional key of the object the formatter returned. If two consecutive emissions have the same key the returned observable will not emit again.</p> |

**Example**  
```js
return trxData
   .pipe(
     parseResponse(
       response$,
       this.parseTrxEvent, // e.g. reads bytes into an object describing the device state, containing frequency, mode, ...
       (trxEvent) => ({ frequency: trxEvent.frequency }),
       "frequency"
     )
   )
```
<a name="poll"></a>

## poll(observableFactory, distinctKey, interval) ⇒ <code>Observable</code>
<p>Polls an observable factory (usually a function returning a promise)
every n ms and emits values including a timestamp <strong>Note</strong>: The
observable returned by this utility wait for calls to the factory to
return. It is not guaranteed to return a value every n ms.</p>

**Kind**: global function  
**Returns**: <code>Observable</code> - <p>An observable that emits with every finished poll call to observable factory</p>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| observableFactory | <code>function</code> |  | <p>a function to poll</p> |
| distinctKey | <code>string</code> |  | <p>a key which needs to change in order for the returned observable to emit</p> |
| interval | <code>number</code> | <code>500</code> | <p>the minimum amount of milliseconds for which to repeat the call to observableFactory</p> |

**Example**  
```js
const $freq = poll(async () => ({ frequency: await getFrequency() }), "frequency")
 $freq.subscribe(console.log)
```
<a name="toLittleEndianBCD"></a>

## toLittleEndianBCD(input) ⇒ <code>Uint8Array</code>
<p>Converts an input number to BCD in little endian byte order.</p>

**Kind**: global function  
**Returns**: <code>Uint8Array</code> - <p>the BCD representation of the input number in little endian byte order</p>  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>number</code> | <p>The input number</p> |

<a name="invertMap"></a>

## invertMap(input) ⇒ <code>Map</code>
<p>A type safe utility to invert a JavaScript Map.</p>

**Kind**: global function  
**Returns**: <code>Map</code> - <p>The inverted map (type-safe)</p>  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>Map</code> | <p>The input map to invert</p> |

<a name="oneOf"></a>

## oneOf(ary) ⇒ <code>z.Schema</code>
<p>a zod utility to validate inclusion of a value in an array</p>

**Kind**: global function  
**Returns**: <code>z.Schema</code> - <p>A zod schema describing the validation</p>  

| Param | Type | Description |
| --- | --- | --- |
| ary | <code>Array</code> | <p>The array in which the valud should be included.</p> |

