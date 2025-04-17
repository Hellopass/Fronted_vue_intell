import axios from "./axios.js"
import jwt_parse from "../assets/jwt.js";
import nginx from './nginx.js'

//专利类
export class Patent {
// 构造函数，用于创建一个新的专利申请对象
    constructor(PatentName, PatentType, UserID, Status) {
        // 将传入的专利名称赋值给对象的PatentName属性
        this.PatentName = PatentName;
        // 将传入的发明人ID赋值给对象的InventorId属性
        this.UserID = UserID;
        // 将传入的专利类型赋值给对象的PatentType属性
        this.PatentType = PatentType;
        // 将传入的专利状态赋值给对象的Status属性
        this.Status = Status;
    }
}


// 定义一个名为 parseJwt 的函数，用于解析 JSON Web Token (JWT)
function parseJwt() {
    // 从浏览器的本地存储（localStorage）中获取名为 'token' 的项，并将其赋值给常量 token
    const token = localStorage.getItem('token')
    // 调用 jwt_parse 函数，将获取到的 token 作为参数传入，并返回解析后的结果
    return jwt_parse(token)
}

//发送请求 基本请求
export function CreatePatent(Patent) {
    const parse = parseJwt() //user_id = parse.user_id
    Patent.UserID = parse.user_id
    return axios.post(`/patent/add`, Patent, {
        headers: {'Content-Type': 'multipart/form-data'} //设置请求头，指定请求体的类型为multipart/form-data
    })
}

//上传文件
export function UploadFile(file, apply_no) {
    const filedata = new FormData()
    filedata.append('apply_no', apply_no)
    file.value.forEach(files => {
        filedata.append('file', files.file)
    })
    return axios.post('/patent/upload_file', filedata, {
        headers: {'Content-Type': 'multipart/form-data'} //设置请求头，指定请求体的类型为multipart/form-data
    })
}


//查询有所专利信息
export function GetPatentList() {
    return axios.get('/patent/find');
}

//模糊查询
export function GetPatentListByKeyword(keyword, status) {
    return axios.get(`/patent/find_fuzzy`, {
        params: {
            keyword: keyword,
            status: status
        }
    });
}

//删除专利信息
export function DeletePatent(apply_no) {
    return axios.delete(`/patent/delete`, {
        params: {
            apply_no: apply_no
        }
    });
}

//获取专利地址
export function GetPatentFilePath(apply_no) {
    return axios.get(`/patent/find_file`, {
        params: {
            applicationNo: apply_no
        }
    })
}

//获取专利文件
export function GetPatentFile(url) {
    return nginx.get(url)
}