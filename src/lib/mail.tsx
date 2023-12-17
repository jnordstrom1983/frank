import AddedToSpace from "@/emails/addedToSpace"
import LoginEmail from "@/emails/login"
import { WelcomeNewUserEmail } from "@/emails/welcomeNewUser"
import WelcomeNewUserNewSpaceEmail from "@/emails/welcomeNewUserNewSpace"
import { languages } from "@/languages/languages"
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

export async function sendEmailSignin(code: number, token: string, to: string, language : string) {
    //@ts-ignore
    let lang = languages[language]
    if(!lang) lang= languages.en;

    function getPhrase(phraseId : string){
        const frank = process.env.BRANDING_FRANK ||  "Frank"
        let value = lang?.phrases[phraseId]  || ""
        return value.replace("{frank}", frank)
    }

    const html = render(<LoginEmail code={code} url={`${process.env.PUBLIC_URL}/login/verify?token=${token}&code=${code}` || ""} language={language}></LoginEmail>)
    console.log(html)
    await sendEmail(getPhrase("email_login_login_subject"), html, to)
}

export function sendWelcomeNewUserNewSpace(space: string, to: string) {
    //@ts-ignore
    let lang = languages[language]
    if(!lang) lang= languages.en;

    function getPhrase(phraseId : string){
        const frank = process.env.BRANDING_FRANK ||  "Frank"
        let value = lang?.phrases[phraseId]  || ""
        return value.replace("{frank}", frank)
    }

    const frank = process.env.BRANDING_FRANK ||  "Frank"
    const language = process.env.EMAIL_DEFAULT_LANGUAGE || "en"
    const html = render(<WelcomeNewUserNewSpaceEmail space={space} url={`${process.env.PUBLIC_URL}` || ""} language={language}></WelcomeNewUserNewSpaceEmail>)
    sendEmail(getPhrase("email_welcomenewuser_newspace_subject"), html, to)
}

export function sendWelcomeNewUser(to: string) {
    //@ts-ignore
    let lang = languages[language]
    if(!lang) lang= languages.en;

    function getPhrase(phraseId : string){
        const frank = process.env.BRANDING_FRANK ||  "Frank"
        let value = lang?.phrases[phraseId]  || ""
        return value.replace("{frank}", frank)
    }
    
    const frank = process.env.BRANDING_FRANK ||  "Frank"
    const language = process.env.EMAIL_DEFAULT_LANGUAGE || "en"
    const html = render(<WelcomeNewUserEmail url={`${process.env.PUBLIC_URL}` || ""} language={language}></WelcomeNewUserEmail>)
    sendEmail(getPhrase("email_welcomenewuser_subject"), html, to)
}

export function sendAddedToNewSpace(space: string, to: string) {
    //@ts-ignore
    let lang = languages[language]
    if(!lang) lang= languages.en;

    function getPhrase(phraseId : string){
        const frank = process.env.BRANDING_FRANK ||  "Frank"
        let value = lang?.phrases[phraseId]  || ""
        return value.replace("{frank}", frank)
    }

    const frank = process.env.BRANDING_FRANK ||  "Frank"
    const language = process.env.EMAIL_DEFAULT_LANGUAGE || "en"
    const html = render(<AddedToSpace space={space} url={`${process.env.PUBLIC_URL}` || ""} language={language}></AddedToSpace>)
    sendEmail(getPhrase("email_addedtospace_subject"), html, to)
}
