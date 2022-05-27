export default (name: string, link: string) => `
  <html>
    <body>
      <h1>Password reset</h1>
      <p>Hello ${name}, your password was successfully re-defined</p>
      <p><a href="${link}">Click here</a> to login</p>
    </body>
  </html>
`.replace(/\s{2,}/g, ' ')
