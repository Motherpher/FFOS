import type { FFOSObject, StateTransitionEvent } from "../../core-model/src/index";

export interface ExternalReceipt {
  receiptId: string;
  dispatchId: string;
  destinationType: string;
  externalRef: string;
  externalVersion?: string;
  receiptStatus: string;
  receivedAt: string;
  payload?: Record<string, unknown>;
}

export interface RegistryStore {
  appendObjectVersion(object: FFOSObject): Promise<void>;
  appendEvent(event: StateTransitionEvent): Promise<void>;
  appendExternalReceipt(receipt: ExternalReceipt): Promise<void>;
  getCurrentObject<T extends FFOSObject = FFOSObject>(objectId: string): Promise<T | null>;
  getCurrentState(objectId: string): Promise<StateTransitionEvent | null>;
  getHistory(objectId: string): Promise<StateTransitionEvent[]>;
}

export class RegistryInvariantError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RegistryInvariantError";
  }
}

export function assertTransitionContinuity(
  current: StateTransitionEvent | null,
  next: StateTransitionEvent,
): void {
  if (!current && next.fromState !== undefined) {
    throw new RegistryInvariantError("Initial event must not claim a previous state.");
  }

  if (current && next.fromState !== current.toState) {
    throw new RegistryInvariantError(
      `Transition discontinuity for ${next.objectId}: expected fromState=${current.toState}, received ${next.fromState ?? "undefined"}.`,
    );
  }

  if (current && Date.parse(next.timestamp) < Date.parse(current.timestamp)) {
    throw new RegistryInvariantError("Registry events may not move backward in event time.");
  }
}

export async function appendTransition(
  store: RegistryStore,
  event: StateTransitionEvent,
): Promise<void> {
  const current = await store.getCurrentState(event.objectId);
  assertTransitionContinuity(current, event);
  await store.appendEvent(event);
}
