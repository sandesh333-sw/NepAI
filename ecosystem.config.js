module.exports = {
  apps: [
    {
      name: "nepai",
      script: ".next/standalone/server.js",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: 'localhost'
      }
    }
  ]
}
