

export const metadata = {
    title: "Frank",
    description: ".",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {



    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    )
}
