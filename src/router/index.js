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
            path: '/home',
            name: 'home',
            meta: { requiresAuth: true },
            component: () => import('../components/home.vue'),
            children: [
                {
                    path: '/dashboard',
                    name: 'dashboard',
                    meta: { requiresAuth: true },
                    component: () => import('../components/dashboard/dashboard.vue'),
                },
                {
                    //     专利申请
                    path: '/patent_apply',
                    name: 'patent_apply',
                    meta: { requiresAuth: true },
                    component: () => import('../components/patent/patent_application.vue'),
                },
                {
                    //专利检索
                    path: '/patent_search',
                    name: 'patent_search',
                    meta: { requiresAuth: true },
                    component: () => import('../components/patent/patent_search.vue'),
                },
                {
                    //专利年费管理
                    path: '/patent_fee',
                    name: 'patent_fee',
                    meta: { requiresAuth: true },
                    component: () => import('../components/patent/patent_fee.vue'),
                },
                {
                    //专利数据统计
                    path: '/patent_statistics',
                    name: 'patent_statistics',
                    meta: { requiresAuth: true },
                    component: () => import('../components/patent/patent_statistics.vue'),
                },
                {
                    //个人信息
                    path: '/personal_information',
                    name: 'personal_information',
                    meta: { requiresAuth: true },
                    component: () => import('../components/personal/personal.vue'),
                }
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
