import { AGCAttack } from "./AGCAttack";

/**
 *  An object describing the state of the AGC. Contains the attack time (minus
 *  "Auto") and whether the AGC is currently automatically managed by the
 *  device itself.
 */
export interface AGCState {
  attack: Omit<AGCAttack, AGCAttack.Auto>,
  auto: boolean
}
