/**
 *  The type for what a device log can emit. Emissions always contain the
 *  command key, the optional parameter it was called with and a timestamp.
 *  If the command returned, the result it set to what it returned, if it
 *  error'd the error is set.
 */
export type DeviceLog = ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any;
} | {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
}) & {
  command: string;
  parameter?: object;
  timestamp: Date;
};
