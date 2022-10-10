import axios, { AxiosError, AxiosResponse } from "axios";
import { resolve } from "path";
import { toast } from "react-toastify";
import { customHistory } from "../..";

const sleep =()=>new Promise(resolve=>setTimeout(resolve,500));

axios.defaults.baseURL = 'http://localhost:5000/api/';
axios.defaults.withCredentials=true;

const responseBody = (response: AxiosResponse) => response.data;

axios.interceptors.response.use( async response => {
    await sleep();
    return response
}, (error: AxiosError) => {
    //@ts-ignore
    const { data, status } = error.response!;
    switch (status) {
        case 400:
            //@ts-ignore
            if (data.errors) {
                const modelStateErrors: string[] = [];
                //@ts-ignore
                for (const key in data.errors) {
                    //@ts-ignore
                    if (data.errors[key]) {
                        //@ts-ignore
                        modelStateErrors.push(data.errors[key])
                    }
                }
                throw modelStateErrors.flat();
            }
            //@ts-ignore

            toast.error(data.title);
            break;
        case 401:
            //@ts-ignore
            toast.error(data.title);
            break;
        case 500:
            //@ts-ignore
            customHistory.push({
                pathname:'/server-error',
                state:{error:data}
            })
             break;
        default:
            break;
    }
    return Promise.reject(error.response);
})
const requests = {
    get: (url: string) => axios.get(url).then(responseBody),
    post: (url: string, body: {}) => axios.post(url, body).then(responseBody),
    put: (url: string, body: {}) => axios.put(url, body).then(responseBody),
    delete: (url: string) => axios.delete(url).then(responseBody),
}

const Catalog = {
    list: () => requests.get('products'),
    details: (id: number) => requests.get(`products/${id}`),
}

const Basket ={
    get:()=>requests.get('basket'),
    addItem:(productId:number,quantity=1)=>requests.post(`basket?productId=${productId}&quantity=${quantity}`,{}),
    removeItem:(productId:number,quantity=1)=>requests.delete(`basket?productId=${productId}&quantity=${quantity}`),
}
const TestErrors = {
    get400Error: () => requests.get('buggy/bad-request'),
    get401Error: () => requests.get('Buggy/unauthorised'),
    get404Error: () => requests.get('Buggy/not-found'),
    get500Error: () => requests.get('Buggy/server-error'),
    getValidationError: () => requests.get('Buggy/validation-error')
}

const agent = {
    Catalog,
    TestErrors,
    Basket
}

export default agent;