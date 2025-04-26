import {createRouter, createWebHistory} from 'vue-router'


const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'login',
            component: () => import('../components/login.vue'),
        },
        {
            path: '/register',
            name: 'register',
            component: () => import('../components/register.vue'),
        },
        {
            path: '/forget',
            name: 'forget',
            component: () => import('../components/forgetpassword.vue'),
        },
        {
            path:'/user',
            name:'user',
            meta: { requiresAuth: true },
            component:()=>import('../components/user.vue'),
            children: [
                {
                    //     专利申请
                    path: 'user_patent_apply',
                    name: 'user_patent_apply',
                    meta: { requiresAuth: true },
                    component: () => import('../components/patent/patent_application.vue'),
                },
                {
                    //个人信息
                    path: 'user_personal_information',
                    name: 'user_personal_information',
                    meta: { requiresAuth: true },
                    component: () => import('../components/personal/personal.vue'),
                },
                {
                    path: 'user_article_information',
                    name: 'user_article_information',
                    meta: { requiresAuth: true },
                    component: () => import('../components/article/article_information.vue'),
                },
                {
                    path: 'user_trademark_information',
                    name: 'user_trademark_information',
                    meta: { requiresAuth: true },
                    component: () => import('../components/trademark/trademark_information.vue'),
                },
            ]
        },

        {
            path: '/home',
            name: 'home',
            meta: { requiresAuth: true },
            component: () => import('../components/home.vue'),
            children: [
                // 仪表盘
                {
                    path: 'dashboard',
                    name: 'dashboard',
                    meta: { requiresAuth: true },
                    component: () => import('../components/dashboard/dashboard.vue'),
                },
                //文档库
                {
                    path: 'file_information',
                    name: 'file_information',
                    meta: { requiresAuth: true },
                    component: () => import('../components/Files/files_information.vue'),
                },
                {
                 //     专利申请
                    path: 'patent_apply',
                    name: 'patent_apply',
                    meta: { requiresAuth: true },
                    component: () => import('../components/patent/patent_application.vue'),
                },
                {
                    //个人信息
                    path: 'personal_information',
                    name: 'personal_information',
                    meta: { requiresAuth: true },
                    component: () => import('../components/personal/personal.vue'),
                },
                //著作信息
                {
                    path: 'article_information',
                    name: 'article_information',
                    meta: { requiresAuth: true },
                    component: () => import('../components/article/article_information.vue'),
                },
                //商标信息
                {
                    path: 'trademark_information',
                    name: 'trademark_information',
                    meta: { requiresAuth: true },
                    component: () => import('../components/trademark/trademark_information.vue'),
                },
                //专利年费信息
                {
                    path: 'patentfee_information',
                    name: 'patentfee_information',
                    meta: { requiresAuth: true },
                    component: () => import('../components/patent/patent_fee.vue'),
                },
                //商标年费信息
                {
                    path: 'trademarkfee_information',
                    name: 'trademarkfee_information',
                    meta: { requiresAuth: true },
                    component: () => import('../components/trademark/trademark_fee.vue'),
                },
                //著作年费信息
                {
                    path: 'articlefee_information',
                    name: 'articlefee_information',
                    meta: { requiresAuth: true },
                    component: () => import('../components/article/aritcle_fee.vue'),
                },
                  //专利接口信息
                  {
                    path: 'interface',
                    name: 'interface',
                    meta: { requiresAuth: true },
                    component: () => import('../components/interface/interfacemanagement.vue'),
                },
            ],
        },
        // 404 处理（必须放在最后）
        {
            path: '/404',
            name: 'NotFound',
            component: () => import('../components/404.vue'),
            meta: { hideHeader: true } // 示例：隐藏页面头部
        },
        {
            path:  '/:catchAll(.*)',
            redirect: '/404'
        }

    ],
})

//全局前置守卫
router.beforeEach((to, from, next) => {
    // 检查目标路由是否需要认证
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

    // 获取用户登录状态（示例从localStorage获取）
    const isAuthenticated = localStorage.getItem('token') !== null

    // 需要登录但未认证
    if (requiresAuth && !isAuthenticated) {
        next({
            path: '/', // 重定向到登录页
        })
    }
    // 已登录时访问登录页，重定向到首页
    else if (to.path === '/login' && isAuthenticated) {
        next('/')
    }
    // 其他情况正常放行
    else {
        next()
    }
})
export default router
