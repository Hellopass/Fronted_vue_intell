import axios from 'axios';

// 创建axios实例
const instance = axios.create({
    baseURL: '/nginx', // 基础URL
    timeout: 5000, // 请求超时时间
    responseType: 'blob' // 设置响应类型为blob
});

export default instance;

