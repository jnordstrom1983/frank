import { WebhookEvent, WebhookEventPayload, WebhookEventTask, WebhookEventsEnum } from "@/models/webhook";
import { collections } from "./db";
import shortUUID from "short-uuid";
import { ContentData } from "@/models/contentdata";
import axios, { AxiosError } from "axios"

export async function processWebhooks(spaceId : string, contentId : string, event : WebhookEventsEnum){
    const webhooks = await collections.webhook.findMany({spaceId : spaceId, events : event, enabled : true});

    if(webhooks.length === 0) return;

    const webhookEventId = shortUUID().generate();
    const contentItem = await collections.content.findOne({ spaceId, contentId})
    if(event === "content.delete" || event == "draft.delete"){
    }else{
        if(!contentItem) return;
    } 

    const data = await collections.contentData.findMany({spaceId, contentId})


    let payload : WebhookEventPayload = {
        spaceId,
        webhookEventId,
        webhookId: "",
        event,
        content : {
            contentId
        }
    } 
    if(contentItem){
       payload.content = {
            status: contentItem.status,
            contentTypeId: contentItem.contentTypeId,
            data : data.map(d=>{
                return {
                    languageId : d.languageId,
                    data : d.data
                }
            }),
            contentId: contentId
        }
    }

    //Create webhook events
    let createdEvents : string[] = []
    for(let webhook of webhooks){
        let event : WebhookEvent = {
            status: "pending",
            spaceId: spaceId,
            webhookId: webhook.webhookId,
            created: new Date(),
            webhookEventId: shortUUID().generate(),
            payload : {...payload, webhookId: webhook.webhookId},
            requests: []
        }
        const created = await collections.webhookEvent.create(event)
        if(created){
            createdEvents.push(created.webhookEventId)
        }
    }

    //Process webhook events
    for(let eventId of createdEvents){
        await processWebhookEvent(eventId)
    }
}


async function processWebhookEvent(webhookEventId : string){
    const event = await collections.webhookEvent.findOne({webhookEventId});
    if(!event) return;

    const webhook = await collections.webhook.findOne({webhookId : event.webhookId});
    if(!webhook) return;

    if(!webhook.enabled) return

    try{

        const resp = await axios.post(webhook.endpoint, event.payload);
        const req : WebhookEventTask = {
            created: new Date(),
            taskId: shortUUID().generate(),
            success: true,
            responseCode : resp.status,
            responseText : resp.data.toString
        }
        event.requests.push(req)
        event.status = "success"
        await collections.webhookEvent.updateOne({ webhookEventId}, { $set : { status : event.status, requests : event.requests }})

    }catch(ex: any ){
        const responseText = ex?.response?.data?.toString() || ""
        const responseCode = parseInt(ex?.response?.status || "0")

        const req : WebhookEventTask = {
            created: new Date(),
            taskId: shortUUID().generate(),
            success: false,
            responseCode,
            responseText
        }
        event.requests.push(req)
        if(event.requests.length > 4){
            event.status = "error"
        }else{
            event.status = "trying"
        }
        await collections.webhookEvent.updateOne({ webhookEventId}, { $set : { status : event.status, requests : event.requests }})

    }
   

}


export async function processTryingEvents(){
    const events = await collections.webhookEvent.findMany({status : "trying"});
    for(const event of events){
        await processWebhookEvent(event.webhookEventId)
    }
}