export default (link: string) => `
  <html>
    <body>
      <h1>Password recovery</h1>
      <p><a href="${link}">Click here</a> to reset your password</p>
    </body>
  </html>
`.replace(/\s{2,}/g, ' ')
