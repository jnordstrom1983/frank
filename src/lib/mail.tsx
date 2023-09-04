import AddedToSpace from "@/emails/addedToSpace"
import LoginEmail from "@/emails/login"
import { WelcomeNewUserEmail } from "@/emails/welcomeNewUser"
import WelcomeNewUserNewSpaceEmail from "@/emails/welcomeNewUserNewSpace"
import { render } from "@react-email/render"
import nodemailer from "nodemailer"

let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST || "",
    port: parseInt(process.env.EMAIL_SERVER_PORT || "25"),
    auth: {
        user: process.env.EMAIL_SERVER_USER || "",
        pass: process.env.EMAIL_SERVER_PASSWORD || "",
    },
})

export async function sendEmail(subject: string, html: string, to: string) {
    const message = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
    }
    await transporter.sendMail(message)
}

export async function sendEmailSignin(code: number, token: string, to: string) {
    const html = render(<LoginEmail code={code} url={`${process.env.PUBLIC_URL}/login/verify?token=${token}&code=${code}` || ""}></LoginEmail>)
    await sendEmail("Log in to Frank", html, to)
}

export function sendWelcomeNewUserNewSpace(space: string, to: string) {
    const html = render(<WelcomeNewUserNewSpaceEmail space={space} url={`${process.env.PUBLIC_URL}` || ""}></WelcomeNewUserNewSpaceEmail>)
    sendEmail("Welecome to Frank", html, to)
}

export function sendWelcomeNewUser(to: string) {
    const html = render(<WelcomeNewUserEmail url={`${process.env.PUBLIC_URL}` || ""}></WelcomeNewUserEmail>)
    sendEmail("Welecome to Frank", html, to)
}

export function sendAddedToNewSpace(space: string, to: string) {
    const html = render(<AddedToSpace space={space} url={`${process.env.PUBLIC_URL}` || ""}></AddedToSpace>)
    sendEmail("New space added", html, to)
}
