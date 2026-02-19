export const getCurrentUser = (req, res) => {
  res.json(req.user);
};
