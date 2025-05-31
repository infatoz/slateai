// src/auth/auth.js
export const isAuthenticated = () => {
  return localStorage.getItem("authUser") !== null;
};

export const loginUser = (user) => {
  localStorage.setItem("authUser", JSON.stringify(user));
};

export const logoutUser = () => {
  localStorage.removeItem("authUser");
};
