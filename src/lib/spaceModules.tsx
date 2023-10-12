import { ReactElement } from "react";
import { Globe } from "react-feather";

export const SpaceModules : { id : string, name : string, icon : ReactElement, description : string }[] = [{
    id : "translation",
    name : "Translation",
    description : "Manage translations files",
    icon : <Globe></Globe>
}]  