import { SpaceItem } from "@/app/api/space/get";
import { UserProfileGetResponse } from "@/app/api/user/profile/get";
import { SpaceModules } from "./spaceModules";

export function chunks<T>(arr: T[], len: number) {

    var chunks = [],
        i = 0,
        n = arr.length;

    while (i < n) {
        chunks.push(arr.slice(i, i += len));
    }

    return chunks;
}


export const slugify = (str: string) =>
    str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');




export function camelize(str : string) {
    const a = str.toLowerCase().replace(/[^0-9a-z _-]/gi, '')
        .replace(/[-_\s.]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
    return a.substring(0, 1).toLowerCase() + a.substring(1);
}


export function padZero(num:number, size:number): string {
    let s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}


export function getSpaceHome(profile : UserProfileGetResponse, space : SpaceItem){
    if(profile.role === "admin" || space.role === "owner"){
        return `/portal/spaces/${space.spaceId}/content`
    }
    if(space.userFeatures.includes("content")){
        return `/portal/spaces/${space.spaceId}/content`
    }
    if(space.userFeatures.includes("asset")){
        return `/portal/spaces/${space.spaceId}/asset`
    }
    if(space.modules.length > 0){
        return `/portal/spaces/${space.spaceId}/modules/${space.modules[0]}`
    }
    const firstLink = space.links.find(l=>l.type === "embedded" && l.placement == "menu")
    if(firstLink){
        return `/portal/spaces/${space.spaceId}/links/${firstLink.linkId}`
    }
    return `/portal/spaces/${space.spaceId}/empty`

}