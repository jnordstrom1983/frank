

import { Configuration, OpenAIApi } from "openai";
import { collections } from "./db";
import { getAllLangauges } from "./lang";
import { SpaceLanguageEnum } from "@/models/space";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_APIKEY,
});
const openai = new OpenAIApi(configuration);


export async function processAITask(taskId: string) {
    const languages =  SpaceLanguageEnum.options.map(l => 
        (
            //@ts-ignore
            { code: l, name: en[`language_${l}`]  }
        )

    )
    
    const task = await collections.aiTask.findOne({ taskId });
    if (!task) return;


    let prompt = "";
    switch (task.module) {
        case "check":
            prompt = `Check the spelling and grammar in the properties written in ${languages.find(l => l.code === task.languages?.from || "")?.name || ""} of the following JSON-object\n\n${JSON.stringify(task.data, null, 3)}\n\n Return in only JSON. Never answer with anything else but the JSON-object in plaintext. `
            break;
        case "translate":
            prompt = `Translate the properties written in ${languages.find(l => l.code === task.languages?.from || "")?.name || ""} of the following JSON-object\n\n${JSON.stringify(task.data, null, 3)}\n\nTranslate to  ${languages.find(l => l.code === task.languages?.to || "")?.name || ""}\n\n Return in only JSON. Do not translate the property names, only the values.  Never answer with anything else but the JSON-object in plaintext. `
            break;
        case "reprahse":
            if (task.details?.input === "context") {
                console.log(task)
                prompt = `Rewrite the contents of the properties written in ${languages.find(l => l.code === task.languages?.from || "")?.name || ""} of the following  JSON-object\n\n${JSON.stringify(task.data, null, 3)}\n\n. Make the properties make sense depending on the name of the properties and the context of the contents of the following context.\n\n If the current value is empty make up a new text with the style defined of the property and create the content based on all the properties in the JSON-object below.\n\n JSON object:\n\n${JSON.stringify(task.details?.allData, null, 3)}\n\n Keep the values to be written in ${languages.find(l => l.code === task.languages?.from || "")?.name || ""}. Return in only JSON. Do not translate the property names, only the values.  Never answer with anything else but the JSON-object in plaintext. `
            }
            if (task.details?.input === "positive") {
                prompt = `Rewrite the contents of the properties, written in ${languages.find(l => l.code === task.languages?.from || "")?.name || ""}, of the following JSON-object\n\n${JSON.stringify(task.data, null, 3)}\n\n. Make the tone of the text to be more positive and inspring. \n\n Keep the values to be written in ${languages.find(l => l.code === task.languages?.from || "")?.name || ""}. Return in only JSON. Do not translate the property names, only the values.  Never answer with anything else but the JSON-object in plaintext. `
            }
            if (task.details?.input === "free") {
                prompt = `Rewrite the contents of the properties, written in ${languages.find(l => l.code === task.languages?.from || "")?.name || ""}, of the following JSON-object\n\n${JSON.stringify(task.data, null, 3)}.\n\n Use new wording but keep the meaning of the content. \n\n  Keep the values to be written in ${languages.find(l => l.code === task.languages?.from || "")?.name || ""}. Return in only JSON. Do not translate the property names, only the values.  Never answer with anything else but the JSON-object in plaintext. `
            }
            if (task.details?.input === "formal") {
                prompt = `Make the properties written in ${languages.find(l => l.code === task.languages?.from || "")?.name || ""} of the following  JSON-object\n\n${JSON.stringify(task.data, null, 3)}\n\nTo be more formal.\n\n Return in only JSON. Keep the values to be written in ${languages.find(l => l.code === task.languages?.from || "")?.name || ""}.  Do not translate the property names, only the values.  Never answer with anything else but the JSON-object in plaintext. `
            }
            break;

    }

    if (prompt) {
        await collections.aiTask.updateOne({ taskId }, { $set: { started: new Date() } })
        const resp = await getChatCompilationJSON({ prompt })

        if (resp) {
            await collections.aiTask.updateOne({ taskId }, { $set: { result: resp, state: "done", completed: new Date() } })
        } else {
            await collections.aiTask.updateOne({ taskId }, { $set: { state: "error" } })
        }
    } else {
        await collections.aiTask.updateOne({ taskId }, { $set: { state: "error" } })
    }



}

export async function getChatCompilationJSON({
    prompt
}: { prompt: string }) {
    const result = await getChatComplition({ prompt })
    if (result) {
        try {
            return JSON.parse(result)
        } catch (ex: any) {
            console.log(ex.message)
            return null;
        }
    } else {
        return null;
    }

}


export async function getChatComplition({
    prompt
}: { prompt: string }) {

    try {
        const completion = await openai.createChatCompletion({
            model: process.env.OPENAI_MODEL || "",
            messages: [{ role: "user", content: prompt }],

        });


        return completion.data.choices[0].message?.content || "";
    } catch (error: any) {
        if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }
        return null;
    }


}

