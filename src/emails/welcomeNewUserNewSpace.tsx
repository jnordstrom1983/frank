import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components"
import { button, container, footer, main, paragraph, spacing } from "./styles"

export const WelcomeNewUserNewSpaceEmail = ({ url, space }: { url: string; space: string }) => (
    <Html>
        <Head />
        <Preview>Welcome to Charlee</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={{ textAlign: "center" }}>
                    <Heading>Welcome to Charlee!</Heading>
                    <Text style={spacing}></Text>
                    <Text style={paragraph}>You have been invited to Charlee and the space {space}.</Text>
                    <Text style={paragraph}>To login, simply click the button below.</Text>
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

export default WelcomeNewUserNewSpaceEmail

