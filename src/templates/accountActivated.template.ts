export default (name: string, link: string) => `
  <html>
    <body>
      <h1>Account Activated</h1>
      <p>Hello ${name}, your account was successfully activated!</p>
      <p><a href="${link}">Click here</a> to log in</p>
    </body>
  </html>
`.replace(/\s{2,}/g, ' ')
