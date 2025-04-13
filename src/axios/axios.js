import axios from 'axios';

// 创建axios实例
const instance = axios.create({
    baseURL: '/api', // 基础URL
    timeout: 5000, // 请求超时时间
    headers: {
        'Content-Type': 'application/json',// 默认请求头,
        'Authorization': 'Bearer ' + localStorage.getItem('token') || '' // 添加token
    }
});

export default instance;