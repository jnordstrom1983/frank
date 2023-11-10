import { Bell, Book, Bookmark, Box as BoxIcon, Circle, Link, Users } from "react-feather"


export const Icons = ["link", "bell", "book", "bookmark", "box", "circle", "users"]
export function GetIcon(icon: string) {
    switch (icon) {
        case "link":
            return <Link></Link>
        case "bell":
            return <Bell></Bell>
        case "book":
            return <Book></Book>
        case "bookmark":
            return <Bookmark></Bookmark>
        case "box":
            return <BoxIcon></BoxIcon>
        case "circle":
            return <Circle></Circle>
        case "link":
            return <Link></Link>
        case "users":
            return <Users></Users>


    }
    return <></>;
}

export function GetExternalLink(link: string) {
    let newLink = link
    newLink = newLink.replace("{token}", localStorage.getItem("FRANK_AUTH_TOKEN") || "")
    return newLink;
}