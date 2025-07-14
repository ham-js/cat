/**
 * The base event that devices can emit on the optional `event` observable. It
 * just contains a timestamp.
 */
export interface DeviceEvent {
  timestamp: Date
}
