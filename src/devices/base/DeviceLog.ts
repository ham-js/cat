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
