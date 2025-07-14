import { Device } from "../../base/Device"
import { DeviceType } from "../../base/DeviceType"
import { TransceiverVendor } from "./TransceiverVendor"
import { VFOType } from "./VFOType"
import { merge, Observable, share, Subject, takeUntil } from "rxjs"
import { TransceiverEvent, TransceiverEventType } from "./TransceiverEvent"
import { poll } from "../../base/utils/poll"
import { Direction } from "./Direction"
import { Band } from "./Bands"
import { AntennaTunerState } from "./AntennaTunerState"
import { AGCState } from "./AGCState"
import { AGCAttack } from "./AGCAttack"
import { CTCSSFrequency } from "./CTCSSFrequencies"

/**
 * The base transceiver class. Polls for VFO frequencies by default. Subclasses
 * need to implement VFO get/set commands as that is what defines a
 * transceiver.
 */
export class Transceiver<DataType extends string | Uint8Array> extends Device<DataType> {
  static readonly deviceType = DeviceType.Transceiver
  static readonly deviceVendor: TransceiverVendor

  pollingInterval = 500

  protected _closeEvents = new Subject<void>()
  readonly events: Observable<TransceiverEvent> =
    merge(
      poll(async () => ({
        frequency: await this.getVFOFrequency({ vfo: VFOType.Current }),
        type: TransceiverEventType.VFO as const,
        vfo: VFOType.Current
      }), "frequency"),
      poll(async () => ({
        frequency: await this.getVFOFrequency({ vfo: VFOType.Other }),
        type: TransceiverEventType.VFO as const,
        vfo: VFOType.Other
      }), "frequency"),
    ).pipe(
      takeUntil(this._closeEvents),
      share()
    )

  async close() {
    this._closeEvents.next()
    await super.close()
  }

  // eslint-disable-next-line jsdoc/require-returns-check
  /**
   *  Get the frequency of the specified VFO.
   *  @param {object} parameter The vfo configuration which which to return the frequency
   *  @param {VFOType} parameter.vfo The vfo for which to return the frequency
   *  @returns {Promise<number>} A promise resolving to the frequency of the specified VFO
   */
  getVFOFrequency(parameter: { vfo: VFOType }): Promise<number> {
    throw new Error("Not implemented")
  }
  /**
   *  Set the frequency of the specified VFO.
   *  @param {object} parameter The vfo configuration which which to set the frequency
   *  @param {VFOType} parameter.vfo The vfo for which to set the frequency
   *  @param {number} parameter.frequency The frequency to which to set the VFO
   */
  setVFOFrequency(parameter: { frequency: number, vfo: VFOType }): Promise<void> {
    throw new Error("Not implemented")
  }

  /**
   *  Copy band setting between VFO/memory.
   *  @param {object} parameter The parameters for the copy command
   *  @param {VFOType|"memory"} parameter.source The source from where to copy the band settings
   *  @param {VFOType|"memory"} parameter.target The target where to copy the band settings
   */
  copyBandSettings?(parameter: { source: VFOType | "memory", target: VFOType | "memory" }): Promise<void>

  /**
   *  Set the AGC attack
   *  @param {object} parameter The parameters for the set agc command
   *  @param {AGCAttack} parameter.attack The attack to set
   */
  setAGCAttack?(parameter: { attack: AGCAttack }): Promise<void>
  /**
   *  Get the agc state
   *  @returns {Promise<AGCState>} The agc state of the transceiver
   */
  getAGCState?(): Promise<AGCState>

  /**
   *  Get the auto notch enabled state
   *  @returns {Promise<boolean>} whether the auto notch filter is enabled or not
   */
  getAutoNotchEnabled?(): Promise<boolean>
  /**
   *  Set the enabled state of the auto notch filter
   *  @param {object} parameter The config for the command
   *  @param {boolean} parameter.enabled Whether the auto notch filter should be enabled or not
   */
  setAutoNotchEnabled?(parameter: { enabled: boolean }): Promise<void>

  /**
   *  Get the antenna tuner state
   *  @returns {Promise<AntennaTunerState>} The state of the antenna tuner
   */
  getAntennaTunerState?(): Promise<AntennaTunerState>
  /**
   * Set the antenna tuner state
   * @param {object} parameter The config for the command
   * @param {AntennaTunerState} parameter.state The desired state of the antenna tuner
   */
  setAntennaTunerState?(parameter: { state: AntennaTunerState }): Promise<void>

  /**
   *  Get the audio gain (volume) of the transceiver.
   *  @returns {Promise<number>} the volume of the transceiver between 0 and 1
   */
  getAFGain?(): Promise<number>
  /**
   *  Set the audio gain (volume) of the transceiver
   *  @param {object} parameter The command parameter
   *  @param {number} parameter.gain The desired volume of the transceiver between 0 and 1
   */
  setAFGain?(parameter: { gain: number }): Promise<void>

  /**
   *  Change the band of the transceiver
   *  @param {object} parameter The command parameter
   *  @param {Direction} parameter.direction The direction of the band change (up/down)
   */
  changeBand?(parameter: { direction: Direction }): Promise<void>

  /**
   *  Get the state of the break in
   *  @returns {Promise<boolean>} Whether break in is enabled or not
   */
  getBreakInEnabled?(): Promise<boolean>
  /**
   *  Set the break in state
   *  @param {object} parameter The config for the command
   *  @param {boolean} parameter.enabled The desired state of the break in
   */
  setBreakInEnabled?(parameter: { enabled: boolean }): Promise<void>

  /**
   *  Get whether the manual notch filter is enabled or not
   *  @returns {Promise<boolean>} Whether the manual notch filter is enabled or not
   */
  getManualNotchEnabled?(): Promise<boolean>
  /**
   *  Get the manual notch filter center frequency offset. This value should be
   *  relative to the notch filter edge frequencies as some transceivers allow the user
   *  to set absolute frequency values and some allow relative frequency values.
   *  @returns {Promise<number>} The offset of the manual notch filter center frequency (between 0 and 1)
   */
  getManualNotchFrequencyOffset?(): Promise<number>
  /**
   *  Set the enabled state of the manual notch filter
   *  @param {object} parameter The configuration of enabled state
   *  @param {boolean} parameter.enabled The desired enabled state of the manual notch filter
   */
  setManualNotchEnabled?(parameter: { enabled: boolean }): Promise<void>
  /**
   *  Set the manual notch filter center frequency offset, which should always be relative.
   *  @param {object} parameter The configuration of the offset
   *  @param {number} parameter.frequencyOffset The frequencyOffset of the
   *  manual notch filter, relative to the left and right edge frequencies.
   */
  setManualNotchFrequencyOffset?(parameter: { frequencyOffset: number }): Promise<void>

  /**
   *  Set the band of the current VFO
   *  @param {object} parameter The configuration of the set band command
   *  @param {Band} parameter.band The desired band to set the VFO to
   */
  setBand?(parameter: { band: Band }): Promise<void>

  /**
   *  Get the TX busy state
   *  @returns {Promise<boolean>} Whether the tx is currently busy or not
   */
  getTXBusy?(): Promise<boolean>

  /**
   *  Get whether the RIT/clarifier of the transceiver is enabled
   *  @returns {Promise<boolean>} Whether the RIT is enabled or not
   */
  getRITEnabled?(): Promise<boolean>
  /**
   *  Set the RIT enabled state
   *  @param {object} parameter The configuration of the RIT enabled state
   *  @param {boolean} parameter.enabled The desired state of the RIT
   */
  setRITEnabled?(parameter: { enabled: boolean }): Promise<void>

  /**
   *  Get the CTCSS frequency of the transceiver
   *  @returns {Promise<CTCSSFrequency>} the CTCSS frequency that is currently set
   */
  getCTCSSFrequency?(): Promise<CTCSSFrequency>
  /**
   *  Set the CTCSS frequency of the transceiver
   *  @param {object} parameter The configuration of the command
   *  @param {CTCSSFrequency} parameter.frequency Set the configured CTCSS frequency of the transceiver
   */
  setCTCSSFrequency?(parameter: { frequency: CTCSSFrequency }): Promise<void>

  /**
   *  Get the currently configured DCS code of the transceiver
   *  @returns {Promise<number>} The DCS code
   */
  getDCSCode?(): Promise<number>
  /**
   *  Set the currently configured DCS code of the transceiver
   *  @param {object} parameter The config of the command
   *  @param {number} parameter.code The desired DCS code
   */
  setDCSCode?(parameter: { code: number }): Promise<void>
}
