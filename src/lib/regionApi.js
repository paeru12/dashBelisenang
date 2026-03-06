import api from "./axios";
const route = '/vi4/regions';

export const getProvinces = () => {
    return api.get(route + '/province');
}

export const getRegencies = (provinceId) => {
    return api.get(`${route}/district/${provinceId}`);
}