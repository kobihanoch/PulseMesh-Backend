export const authConfig = {
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET as string,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET as string,
  jwtVerifySecret: process.env.JWT_VERIFY_SECRET as string,
};
