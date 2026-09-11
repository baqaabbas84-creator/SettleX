const { MILESTONE_STATUS, MILESTONE_TRANSITIONS } = require('../config/constants');
const AppError = require('../utils/AppError');

/**
 * Validate that a milestone transition is legal according to the SettleX
 * escrow state machine.
 *
 * @param {string} currentStatus  Current milestone status
 * @param {string} targetStatus   Desired next status
 * @throws {AppError} if the transition is not allowed
 */
const validateTransition = (currentStatus, targetStatus) => {
  const allowed = MILESTONE_TRANSITIONS[currentStatus];

  if (!allowed) {
    throw new AppError(
      `Unknown milestone status: '${currentStatus}'.`,
      400,
      'UNKNOWN_STATUS',
    );
  }

  if (!allowed.includes(targetStatus)) {
    throw new AppError(
      `Transition from '${currentStatus}' to '${targetStatus}' is not allowed.`,
      400,
      'INVALID_STATE_TRANSITION',
    );
  }
};

/**
 * Check whether a milestone has reached a terminal state
 * (RELEASED or REFUNDED).
 */
const isTerminal = (status) => {
  return (
    status === MILESTONE_STATUS.RELEASED ||
    status === MILESTONE_STATUS.REFUNDED
  );
};

module.exports = { validateTransition, isTerminal };
