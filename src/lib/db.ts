import { Document, Filter, ObjectId, OptionalUnlessRequiredId, UpdateFilter, WithId } from "mongodb";
import clientPromise from "./mongodb";
import { User } from "@/models/user";
import { dbCollection } from "./constants";
import { SpaceUser } from "@/models/spaceuser";
import { Space } from "@/models/space";
import { ContentType } from "@/models/contentype";
import { Content } from "@/models/content";
import { ContentData } from "@/models/contentdata";
import { Folder } from "@/models/folder";
import { Database } from "react-feather";
import { HistoryItem } from "@/models/history";
import { TrashItem } from "@/models/trash";
import { AITask } from "@/models/ai";
import { AccessKey } from "@/models/accesskey";
import { Webhook, WebhookEvent } from "@/models/webhook";
import { Asset } from "@/models/asset";
import { AssetFolder } from "@/models/assetfolder";
import { Migration } from "@/models/migration";

export class DatabaseCollection<T extends Document>{
    collectionName: string;

    constructor(collectionName: string) {
        this.collectionName = collectionName;
    }

    async collection() {
        const client = await clientPromise;
        return client.db().collection<T>(this.collectionName)
    }
    async findOne(filter: Filter<T>) {
        const client = await clientPromise;
        const item = await (await this.collection()).findOne<WithId<T>>(filter)
        if (!item) {
            return
        } else {
            const { _id, ...rest } = item;
            return rest;
        }
    }
    async getById(_id: ObjectId) {
        const client = await clientPromise;
        const item = await client.db().collection(this.collectionName).findOne<WithId<T>>({ _id })
        if (!item) {
            return
        } else {
            const { _id, ...rest } = item;
            return rest;
        }
    }

    async aggregate<R extends Document>(pipeline: Document[]) {
        const client = await clientPromise;
        //return await (await this.collection()).aggregate<R>(pipeline).toArray()

        return await (await this.collection()).aggregate<R>(pipeline).toArray()
    }

    async create(obj: OptionalUnlessRequiredId<T>) {
        const client = await clientPromise;
        const insertResult = await (await this.collection()).insertOne(obj)
        return await this.getById(insertResult.insertedId)
    }

    async findMany(filter: UpdateFilter<T>) {
        const client = await clientPromise;
        return await (await this.collection()).find<T>(filter).project({ _id: 0 }).toArray() as T[]
    }
    async deleteMany(filter: UpdateFilter<T>) {
        const client = await clientPromise;
        await (await this.collection()).deleteMany(filter);
    }

    async updateOne(filter: Filter<T>, update: UpdateFilter<T>) {
        const client = await clientPromise;
        const res = await (await this.collection()).updateOne(filter, update)
        return await (await this.collection()).findOne(filter)

    }
    async updateMany(filter: Filter<T>, update: UpdateFilter<T>) {
        const client = await clientPromise;
        const res = await (await this.collection()).updateMany(filter, update)
        return res.matchedCount;
    }


}




export const collections = {
    user: new DatabaseCollection<User>(dbCollection.user),
    space: new DatabaseCollection<Space>(dbCollection.space),
    spaceUser: new DatabaseCollection<SpaceUser>(dbCollection.spaceUser),
    contentType: new DatabaseCollection<ContentType>(dbCollection.contentType),
    content: new DatabaseCollection<Content>(dbCollection.content),
    contentData: new DatabaseCollection<ContentData>(dbCollection.contentData),
    folder: new DatabaseCollection<Folder>(dbCollection.folder),
    history: new DatabaseCollection<HistoryItem>(dbCollection.history),
    trash: new DatabaseCollection<TrashItem>(dbCollection.trash),
    aiTask: new DatabaseCollection<AITask>(dbCollection.aiTask),
    accessKey: new DatabaseCollection<AccessKey>(dbCollection.accessKey),
    webhook: new DatabaseCollection<Webhook>(dbCollection.webhook),
    webhookEvent: new DatabaseCollection<WebhookEvent>(dbCollection.webhookEvent),
    asset: new DatabaseCollection<Asset>(dbCollection.asset),
    assetFolder: new DatabaseCollection<AssetFolder>(dbCollection.assetFolder),
    migration : new DatabaseCollection<Migration>(dbCollection.migration)
}