import { ContentType } from "../networking/FetchClient";


export interface RequestOptions {
    path: string;
    query?: { [x: string]: string };
    isAuthRequired?: boolean;
    contentType?: ContentType;
}

export interface RequestOptionsWithBody<B = any> extends RequestOptions {
    body?: B;
}

export interface ApiError {
    error: {
        code: string;
        title?: string;
        detail?: string;
    };
}

export interface StoreResponse {
    isSuccess: boolean;
    message?: string;
    error?: Object;
    id?: string;
}
