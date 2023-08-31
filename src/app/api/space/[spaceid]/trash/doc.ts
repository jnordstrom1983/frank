
import { GET_DOC } from "./get";
import { PUT_DOC as PUT_ITEM_DOC } from "./[contentid]/put";
import { DELETE_DOC } from "./delete";


export const SPACE_TRASH_DOC = [GET_DOC, PUT_ITEM_DOC, DELETE_DOC]