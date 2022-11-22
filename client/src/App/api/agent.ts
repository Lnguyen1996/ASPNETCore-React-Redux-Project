import { PaginatedResponse } from './../models/pagination';
import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { customHistory } from "../..";
import { store } from '../store/configureStore';

const sleep =()=>new Promise(resolve=>setTimeout(resolve,500));

axios.defaults.baseURL = process.env.REACT_APP_API_URL;
axios.defaults.withCredentials=true;
axios.interceptors.request.use(config=>{
    const token = store.getState().account.user?.token;

    if(token) config.headers!.Authorization = `Bearer ${token}`;
    
    return config;
})
const responseBody = (response: AxiosResponse) => response.data;

axios.interceptors.response.use( async response => {
    if(process.env.NODE_ENV==='development') await sleep();
    const pagination = response.headers['pagination'];

    if(pagination){
        response.data = new PaginatedResponse(response.data,JSON.parse(pagination));
        return response;
    }
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
    get: (url: string,params?:URLSearchParams) => axios.get(url,{params}).then(responseBody),
    post: (url: string, body: {}) => axios.post(url, body).then(responseBody),
    put: (url: string, body: {}) => axios.put(url, body).then(responseBody),
    delete: (url: string) => axios.delete(url).then(responseBody),
}

const Catalog = {
    list: (params:URLSearchParams) => requests.get('products',params),
    details: (id: number) => requests.get(`products/${id}`),
    fetchFilters : ()=>requests.get('products/filters')
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

const Account = {
    login:(values:any) => requests.post('account/login',values),
    register:(values:any) => requests.post('account/register',values),
    currentUser:() => requests.get('account/currentUser'),
    fetchAddress:()=>requests.get('account/savedAddress')
}
const Orders = {
    list:() => requests.get('orders'),
    fetch:(id:number)=>requests.get(`orders/${id}`),
    create:(values:any)=>requests.post('orders',values)
}
const Payments = {
    createPaymentIntent: () => requests.post('payments',{})
}
const agent = {
    Catalog,
    TestErrors,
    Basket,
    Account,
    Orders,
    Payments
}

export default agent;