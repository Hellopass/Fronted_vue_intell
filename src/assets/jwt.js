//解析jwt

const jwt_parse = (token) => {
// 分割 JWT
    const parts = token.split('.');

// 解码负载部分
    return JSON.parse(atob(parts[1]));

}
export default jwt_parse;