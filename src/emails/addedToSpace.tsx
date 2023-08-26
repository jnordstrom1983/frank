import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components"
import { button, container, footer, main, paragraph, spacing } from "./styles"

export const AddedToSpace = ({ url, space }: { url: string; space: string }) => (
    <Html>
        <Head />
        <Preview>You have been added to the space {space}</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={{ textAlign: "center" }}>
                    <Heading>You have been added to {space}!</Heading>
                    <Text style={spacing}></Text>
                    <Text style={paragraph}>You have been added to the space {space} on your Charlee account.</Text>
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

export default AddedToSpace

const codeStyle = {
    backgroundColor: "#f5f5f5",
    borderRadius: "25px",
    padding: "20px",
    fontSize: "32px",
}
