export default {
  NODE_ENV: process.env.NODE_ENV ?? 'test',
  LOG_LEVEL: process.env.LOG_LEVEL ?? 'DEBUG',
  API_HTTP: process.env.API_HTTP ?? 'http',
  API_HOST: process.env.API_HOST ?? '0.0.0.0',
  API_PORT: process.env.API_PORT ?? 3000,
  API_URL: process.env.API_URL ?? 'http://0.0.0.0:3000',
  JWT_SECRET: process.env.JWT_SECRET ?? 'jwtsecret',
  JWT_SESSION_EXP: process.env.JWT_SESSION_EXP ?? '7d',
  JWT_UNIQUE_USE_EXP: process.env.JWT_UNIQUE_USE_EXP ?? '2h',
  CIPHER_ALGORITHM: process.env.CIPHER_ALGORITHM ?? 'aes-192-cbc',
  CIPHER_SALT: process.env.CIPHER_SALT ?? 'salt',
  EMAIL_NAME: process.env.EMAIL_NAME ?? 'Social.Me',
  EMAIL_ADDR: process.env.EMAIL_ADDR ?? 'no-reply@social-me.com',
  EMAIL_HOST: process.env.EMAIL_HOST ?? 'social-me-mailhog',
  EMAIL_PORT: process.env.EMAIL_PORT ?? 1025,
  EMAIL_AUTH: process.env.EMAIL_AUTH ?? null,
  API_CLIENT: process.env.API_CLIENT ?? 'http://localhost:8080'
}
