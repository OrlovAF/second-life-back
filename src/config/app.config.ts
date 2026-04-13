export const appConfig = () => ({
  app: {
    port: process.env.APP_PORT || 3000,
    jwtSecret: process.env.JWT_SECRET,
  },
});
