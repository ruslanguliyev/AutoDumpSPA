type LeaveGuard = (proceed: () => void) => void;

let guard: LeaveGuard | null = null;

export function setDescriptionLeaveGuard(next: LeaveGuard | null) {
  guard = next;
}

export function runDescriptionLeaveGuard(proceed: () => void) {
  if (guard) guard(proceed);
  else proceed();
}
