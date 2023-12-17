import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components"
import { button, container, footer, main, paragraph, spacing } from "./styles"
import { languages } from "@/languages/languages";

export const AddedToSpace = ({ url, space, language }: { url: string; space: string, language: string }) => {

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
            <Preview>{getPhrase("email_addedtospace_preview")} {space}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={{ textAlign: "center" }}>
                        <Heading>{getPhrase("email_addedtospace_haeding")} {space}!</Heading>
                        <Text style={spacing}></Text>
                        <Text style={paragraph}>{getPhrase("email_addedtospace_text1")} {space} {getPhrase("email_addedtospace_text2")}</Text>
                        <Text style={paragraph}>{getPhrase("email_addedtospace_text3")}</Text>
                        <Text style={spacing}></Text>

                        <Button pX={0} pY={20} style={button} href={url}>
                            {getPhrase("email_addedtospace_login")}
                        </Button>

                        <Text style={spacing}></Text>

                        <Text style={footer}>{ (process.env.BRANDING_FRANK || "FRANK").toUpperCase() }</Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    )
}

export default AddedToSpace

const codeStyle = {
    backgroundColor: "#f5f5f5",
    borderRadius: "25px",
    padding: "20px",
    fontSize: "32px",
}
