import { RequestOptions, RequestOptionsWithBody } from "../models/api";
import FetchClient from "./FetchClient";

/**
 * State store responsible for interacting with API.
 *
 * Does not really have any state except for keeping track
 * of tokens and network status.
 */

class ApiClient {
    fetchClient!: FetchClient;

    constructor() {
        this.fetchClient = new FetchClient("/api");
    }

    async get<T>(opts: RequestOptions) {
        return this.fetchClient.doRequest<T>({
            method: "get",
            path: opts.path,
            query: opts.query,
            token: await this.getAccessToken(opts.isAuthRequired),
        });
    }

    async post<T, B = any>(opts: RequestOptionsWithBody<B>) {
        return this.fetchClient.doRequest<T>({
            method: "post",
            path: opts.path,
            body: opts.body,
            query: opts.query,
            contentType: opts.contentType,
            token: await this.getAccessToken(opts.isAuthRequired),
        });
    }

    async uploadFile(data: FormData) {
        return await this.post<any>({
            path: "/file-upload",
            contentType: "multipart/form-data",
            body: data,
            isAuthRequired: true,
        });
    }

    async put<T, B = any>(opts: RequestOptionsWithBody<B>) {
        return this.fetchClient.doRequest<T>({
            method: "put",
            path: opts.path,
            body: opts.body,
            query: opts.query,
            token: await this.getAccessToken(opts.isAuthRequired),
        });
    }

    async delete<T>(opts: RequestOptionsWithBody) {
        return this.fetchClient.doRequest<T>({
            method: "delete",
            path: opts.path,
            body: opts.body,
            query: opts.query,
            token: await this.getAccessToken(opts.isAuthRequired),
        });
    }

    async getAccessToken(isAuthRequired?: boolean) {
        if (isAuthRequired) {
            return localStorage.getItem("CHARLEE_AUTH_TOKEN") || ""
        }
        return undefined;
    }

    async postFile<T>({ path, file, body, isAuthRequired }: { path: string, file: File, body: Record<string, any>, isAuthRequired: boolean }): Promise<T> {

        var data = new FormData()
        data.append('file', file)
        data.append("filename", file.name);
        Object.keys(body).forEach(k => {
            data.append(k, body[k])
        })

        const headers = new Headers({});

        if (isAuthRequired) {
            headers.append("Authorization", `Bearer ${await this.getAccessToken(true)}`);
        }

        const resp = await fetch(`/api${path}`, {
            method: 'POST',
            headers,
            body: data
        })

        return resp.json()


    }
}

export type QueryOpts = {
    enabled?: boolean;
    refetchInterval?: number;
    staleTime?: number;
    retry?: number | boolean;
};

export default ApiClient;

export const apiClient = new ApiClient();
