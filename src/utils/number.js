<<<<<<< HEAD
export const countDecimals = value => {
=======
export const countDecimals = (value) => {
  if (!value) return 0;

>>>>>>> 3bd23bb1faf32382b70b2851b200099e6dd0b945
  if (Math.floor(value) === value) return 0;

  return value.toString().split('.')[1].length || 0;
};
