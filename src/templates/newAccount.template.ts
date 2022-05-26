export default (name: string, link: string) => `
  <html>
    <body>
      <h1>Account activation</h1>
      <p>Hello ${name}, to active your account, please <a href="${link}">click here</a></p>
    </body>
  </html>
`.replace(/\s{2,}/g, ' ')
