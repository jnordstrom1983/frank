import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components"
import { button, container, footer, main, paragraph, spacing } from "./styles"
import { languages } from "@/languages/languages";

export const WelcomeNewUserEmail = ({ url, language }: { url: string, language: string }) => {
    
    //@ts-ignore
    let lang = languages[language]
    if(!lang) lang= languages.en;
    

    function getPhrase(phraseId : string){
        const frank = process.env.BRANDING_FRANK ||  "Frank"
        let value = lang?.phrases[phraseId]  || ""
        return value.replace("{frank}", frank)
    }

    return (





    <Html>
        <Head />
        <Preview>{getPhrase("email_welcomenewuser_preview")}</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={{ textAlign: "center" }}>
                    <Heading>{getPhrase("email_welcomenewuser_haeding")}</Heading>
                    <Text style={spacing}></Text>
                    <Text style={paragraph}>{getPhrase("email_welcomenewuser_text1")}</Text>
                    <Text style={paragraph}>{getPhrase("email_welcomenewuser_text2")}</Text>
                    <Text style={spacing}></Text>

                    <Button pX={0} pY={20} style={button} href={url}>
                        {getPhrase("email_welcomenewuser_login")}
                    </Button>

                    <Text style={spacing}></Text>

                    <Text style={footer}>{ (process.env.BRANDING_FRANK || "FRANK").toUpperCase() }</Text>
                </Section>
            </Container>
        </Body>
    </Html>
)}


export default WelcomeNewUserEmail

