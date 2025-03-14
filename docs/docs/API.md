## Classes

<dl>
<dt><a href="#Device">Device</a></dt>
<dd><p>This is the base device for all classes which can create command strings.
Usually an abstract subclass is created for each type of device, such as
<code>TransceiverDevice</code> to define the deviceType or deviceVendor, but also common
command factories for all instances of that device.</p></dd>
<dt><a href="#TransceiverDevice">TransceiverDevice</a></dt>
<dd><p>A transceiver device is a device with a <code>deviceType</code> <code>DeviceType.Transceiver</code>
and with a <code>vendor</code> of <code>TransceiverDeviceVendor</code>.  There is a common subset
of command factories every transceiver can implement. Some command factories
are mandatory as they define what makes a transceiver (such as setting and
getting the VFO frequency).</p></dd>
</dl>

<a name="Device"></a>

## Device
<p>This is the base device for all classes which can create command strings.
Usually an abstract subclass is created for each type of device, such as
<code>TransceiverDevice</code> to define the deviceType or deviceVendor, but also common
command factories for all instances of that device.</p>

**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| deviceName | <code>string</code> | <p>The name of the actual device</p> |
| deviceType | <code>DeviceType</code> | <p>The type of the device</p> |
| deviceVendor | <code>TransceiverDeviceVendor</code> | <p>The vendor of the device. Will be extended when new devices of different kinds are added.</p> |
| _commandFactories | <code>object</code> | <p>Subclasses use this property to implement command factories. Do not access this directly, use <code>buildCommand</code> instead.</p> |


* [Device](#Device)
    * [.buildCommand(key, parameter)](#Device+buildCommand) ⇒ <code>string</code>
    * [.implementsOptionalCommandFactory(key)](#Device+implementsOptionalCommandFactory) ⇒ <code>boolean</code>
    * [.getCommandFactorySchema(key)](#Device+getCommandFactorySchema) ⇒ <code>object</code>

<a name="Device+buildCommand"></a>

### device.buildCommand(key, parameter) ⇒ <code>string</code>
<p>This method allows you to build command strings.</p>

**Kind**: instance method of [<code>Device</code>](#Device)  
**Returns**: <code>string</code> - <p>a CAT command in the form of a string</p>  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | <p>The key of a command this device implements. You cannot build command strings for optional commands. Use <code>device.implementsOptionalCommand('aCommand')</code> as a type guard in these cases.</p> |
| parameter | <code>object</code> | <p>The parameters this command expects. Will be validated against the schema of that command and might throw an error if invalid parameters are handed in. Some types can be checked at build time, e.g. that a frequency is a <code>number</code>. However a frequency might be restricted to a certain range and that is validated at runtime. You can get the schema of a command by using <code>getCommandSchema</code>.</p> |

**Example**  
```typescript
const device: TransceiverDevice = // ...
device.buildCommand('setVFO', { frequency: 14_250_000, vfo: 0 }) // => "FA14250000;"
device.buildCommand('setVFO', { frequency: -120, vfo: 0 }) // => Will throw an error at runtime, as -120 is a number and TypeScript is happy
device.buildCommand('setAGC', { level: AGCLevel.Off }) // => won't compile as 'setAGC' is an optional command and this device might not implement it
if (device.hasCommand('setAGC')) device.buildCommand('setAGC', { level: AGCLevel.Off }) // => "GC00;"
```
<a name="Device+implementsOptionalCommandFactory"></a>

### device.implementsOptionalCommandFactory(key) ⇒ <code>boolean</code>
<p>This method returns whether this device implements an optional command factory for a given
string. <strong>It ALSO acts as a type guard, so TypeScript knows a command factory with
the given key exists.</strong></p>

**Kind**: instance method of [<code>Device</code>](#Device)  
**Returns**: <code>boolean</code> - <p>whether this device implements that command</p>  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | <p>The key of a command this device might implement.</p> |

**Example**  
```typescript
const device: TransceiverDevice = // ...
if (device.implementsOptionalCommandFactory('setAGC')) {} // the type of the device changed here, so that 'setAGC' is not optional anymore and we can e.g. call buildCommand
```
<a name="Device+getCommandFactorySchema"></a>

### device.getCommandFactorySchema(key) ⇒ <code>object</code>
<p>This method allows you to get the JSON schema for a device.   *</p>

**Kind**: instance method of [<code>Device</code>](#Device)  
**Returns**: <code>object</code> - <p>a json schema for the command that you can use to validate user input or to build forms for devices</p>  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | <p>A key that is guaranteed to be in the schema. You won't be able to call this method for optional commands. In that case use <code>implementsOptionalCommand</code> as a type guard.</p> |

<a name="TransceiverDevice"></a>

## TransceiverDevice
<p>A transceiver device is a device with a <code>deviceType</code> <code>DeviceType.Transceiver</code>
and with a <code>vendor</code> of <code>TransceiverDeviceVendor</code>.  There is a common subset
of command factories every transceiver can implement. Some command factories
are mandatory as they define what makes a transceiver (such as setting and
getting the VFO frequency).</p>

**Kind**: global class  
