import { Command } from "../../base/Command";
import { TransceiverAGCAttack } from "./TransceiverAGCAttack";
import { TransceiverVFOType } from "./TransceiverVFOType";

export type TransceiverCommands = {
  getVFO: Command<{ vfo: TransceiverVFOType }, number>
  setAGC?: Command<{ attack: TransceiverAGCAttack }, void>
  setVFO: Command<{ frequency: number; vfo: TransceiverVFOType }, void>
}
