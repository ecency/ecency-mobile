<<<<<<< HEAD
export default input => {
=======
export default (input) => {
  if (!input) return 0;

>>>>>>> 3bd23bb1faf32382b70b2851b200099e6dd0b945
  if (input === 0) {
    return 25;
  }

  if (!input) {
    return input;
  }

  let neg = false;

  if (input < 0) neg = true;

  let reputationLevel = Math.log10(Math.abs(input));
  reputationLevel = Math.max(reputationLevel - 9, 0);

  if (reputationLevel < 0) reputationLevel = 0;

  if (neg) reputationLevel *= -1;

  reputationLevel = reputationLevel * 9 + 25;

  return Math.floor(reputationLevel);
};
