import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components"
import { button, container, footer, main, paragraph, spacing } from "./styles"

export const LoginEmail = ({ url, code }: { url: string; code: number }) => (
    <Html>
        <Head />
        <Preview>Your Charlee login code</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={{ textAlign: "center" }}>
                    <Heading>Login to Charlee</Heading>
                    <Text style={spacing}></Text>
                    <Text style={paragraph}>Here is your login code for Charlee.</Text>
                    <Text style={paragraph}>To log in, enter the code or press the button below.</Text>
                    <Text style={spacing}></Text>

                    <Text style={codeStyle}>{code.toString().replace(/\B(?=(\d{2})+(?!\d))/g, " ")}</Text>

                    <Text style={spacing}></Text>

                    <Button pX={0} pY={20} style={button} href={url}>
                        SIGN IN
                    </Button>

                    <Text style={spacing}></Text>

                    <Text style={footer}>Charlee</Text>
                </Section>
            </Container>
        </Body>
    </Html>
)

export default LoginEmail

const codeStyle = {
    backgroundColor: "#f5f5f5",
    borderRadius: "25px",
    padding: "20px",
    fontSize: "32px",
}
