import { Providers } from "./providers"
import "./globals.css"
import dayjs from "dayjs"
import relativeTime from 'dayjs/plugin/relativeTime'
import { Dialogs } from "./dialogs"
dayjs.extend(relativeTime)


export const metadata = {
    title: "Frank",
    description: ".",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    <Dialogs>{children}</Dialogs>
                </Providers>
            </body>
        </html>
    )
}
