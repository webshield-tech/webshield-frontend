import api from "./axios";

export const signupUser = (data: {
  username: string;
  email: string;
  password: string;
}) => {
  return api.post("/user/signup", data);
};

export const LoginUser = (data: { email: string; password: string }) => {
  return api.post("/user/login", data);
};

export const LogoutUser = () => {
  return api.post("/user/logout");
};

export const Profile = () => api.get("/user/profile");

export const acceptTerms = () => api.post("/user/accept-terms");

export const forgotPassword = (email: string) =>
  api.post("/auth/forgot-password", { email });

export const resetPassword = (data: { token: string; newPassword: string }) => {
  return api.post("/auth/reset-password", data);
};
