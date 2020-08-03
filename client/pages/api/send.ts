import { NextApiRequest, NextApiResponse } from "next"

import nodemailer from "nodemailer"
import { google } from "googleapis"
import Mail from "nodemailer/lib/mailer"

const { OAuth2 } = google.auth

const OAuth2Client = new OAuth2(
  process.env.OAUTH_ID,
  process.env.OAUTH_SECRET,
  "https://developers.google.com/oauthplayground"
)

OAuth2Client.setCredentials({ refresh_token: process.env.OAUTH_REFRESH_TOKEN })

const access_token = OAuth2Client.getAccessToken()

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: "meszarosdezsodev@gmail.com",
    clientId: process.env.OAUTH_ID,
    clientSecret: process.env.OAUTH_SECRET,
    refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    accessToken: access_token, //access token variable we defined earlier
  },
} as any)

const send = (name: string, email: string, message: string) => {
  const mailOptions: Mail.Options = {
    from: name,
    sender: name,
    to: "meszarosdezsodev@gmail.com",
    subject: `🧑🏽‍💻 New email from ${name}`,
    html: `
    <h3>${name} (${email})</h3>
    
    <p>${message}</p>
    `,
  }

  return new Promise((res, rej) => {
    transport.sendMail(mailOptions, (err, info) => {
      if (err) {
        return rej(err)
      } else {
        transport.close()
        return res(info)
      }
    })
  })
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { name, message, email } = req.body

  try {
    const response = await send(name, email, message)
    return res.send({ statusCode: 200, response })
  } catch (e) {
    console.log(e)
    return res.status(500).send({ statusCode: 500, error: e.message })
  }
}
