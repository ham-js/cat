import { AGCAttack } from "./AGCAttack";

export interface AGCState {
  attack: Omit<AGCAttack, AGCAttack.Auto>,
  auto: boolean
}
