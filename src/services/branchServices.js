import axios from "api/axios";
import authHeader from "./authHeaderServices";

const getBranch = async () => {
    return await axios.get('/api/v1/Branch', { headers: authHeader() });
}

const getBranchById = async (id) => {
    return await axios.get(`/api/v1/Branch/id?id=${id}`, { headers: authHeader() });
}

const createBranch = async () => {
    return await axios.post(`/api/v1/Branch/{'branch'}`, { headers: authHeader() });
}

const updateBranch = async (id) => {
    return await axios.put(`/api/v1/Branch/${id}`, { headers: authHeader() });
}

const deleteBranch = async (id) => {
    return await axios.delete(`/api/v1/Branch/${id}`, { headers: authHeader() });
}

export default {
    getBranch,
    getBranchById,
    createBranch,
    updateBranch,
    deleteBranch
}