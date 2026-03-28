// --- 5. 辅助函数 ---

/** 格式化日期为 YYYY-MM-DD 字符串 */
export function formatDate(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/** 获取指定日期前N天的日期数组 (YYYY-MM-DD) */
export function getLastNDays(startDay, nDays) {
    const dates = [];
    let date = new Date(startDay);
    date.setDate(date.getDate() - (nDays - 1));

    for (let i = 0; i < nDays; i++) {
        dates.push(formatDate(date));
        date.setDate(date.getDate() + 1);
    }
    return dates;
}

// --- 1. 学生名单 (已更新) ---
export const STUDENT_LIST = [
    "stu1", "stu2", "stu3", "stu4",
];
export const TOTAL_STUDENTS = STUDENT_LIST.length;
export const STORAGE_KEY = 'aceAttorneyTaskTrackerData';

// --- 2. 角色数据和台词 (逆转裁判主题) ---
export const NPC_DATA = [
    { name: "成步堂 龙一", image: "https://p3-flow-imagex-download-sign.byteimg.com/tos-cn-i-a9rns2rl98/e9cb0f8f2fff433c99744a9143356a82.png~tplv-a9rns2rl98-24:720:720.png?rcl=20251121230214E24F9DDCD03F26C16B11&rk3s=8e244e95&rrcfp=8a172a1a&x-expires=1764342135&x-signature=LPlRj%2BvQmCxI1EP9olVNt939deo%3D", quotes: ["太棒了！真相只有一个，而你就是证据！", "这是完美的证据，法庭会接纳的！"] },
    { name: "御剑 怜侍", image: "https://p3-flow-imagex-download-sign.byteimg.com/tos-cn-i-a9rns2rl98/0a361303ae70465f854959b46c03b086.png~tplv-a9rns2rl98-24:720:720.png?rcl=20251121230214E24F9DDCD03F26C16B11&rk3s=8e244e95&rrcfp=8a172a1a&x-expires=1764342135&x-signature=Mlbx%2BSWhEoaJUdeAdZLop%2B2RL80%3D", quotes: ["哼。勉强可以作为证据呈上。记住，完美主义是我的信条。", "很好，你没有让我失望。这次我不会提出异议了。"] },
    { name: "绫里 真宵", image: "https://p3-flow-imagex-download-sign.byteimg.com/tos-cn-i-a9rns2rl98/b0d5d6b74c284eb699ff569353209781.png~tplv-a9rns2rl98-24:720:720.png?rcl=20251121230214E24F9DDCD03F26C16B11&rk3s=8e244e95&rrcfp=8a172a1a&x-expires=1764342135&x-signature=pAEzRhgPkf6k3wFsGWiddJxwTEY%3D", quotes: ["哇！太厉害了成步堂君！你成功将证据呈上去了呢！", "啊，肚子饿了！但看到你完成任务，我的心也被治愈了！"] },
    { name: "法官", image: "https://p11-flow-imagex-download-sign.byteimg.com/tos-cn-i-a9rns2rl98/2de8316e0e7c41e98d259d3a83852ba5.png~tplv-a9rns2rl98-24:720:720.png?rcl=20251121231553726E30B60DD9B8819A95&rk3s=8e244e95&rrcfp=8a172a1a&x-expires=1764342953&x-signature=ekz%2F%2B1wwvpBh5sXLpSDQoPbE44w%3D", quotes: ["很好，法庭接纳了这项证物！请继续保持！", "判你通过！这是法庭的决定，不可动摇！"] },
    { name: "狩魔 冥", image: "https://p3-flow-imagex-download-sign.byteimg.com/tos-cn-i-a9rns2rl98/4723d6f0c4314acdac64f1e8af069509.jpg~tplv-a9rns2rl98-24:720:720.png?rcl=20251121230214E24F9DDCD03F26C16B11&rk3s=8e244e95&rrcfp=8a172a1a&x-expires=1764342135&x-signature=f8KywN6r%2FRPVYFeiI%2Bs%2FP6MWIgw%3D", quotes: ["闭嘴！这种程度的证物，也配让我挥动鞭子吗？不过...做得还算合格。", "你的努力没有白费。我承认你的成果。"] },
    { name: "糸锯 圭介", image: "https://p3-flow-imagex-download-sign.byteimg.com/tos-cn-i-a9rns2rl98/fff7c2b5007a40e380c5da22aae827e6.png~tplv-a9rns2rl98-24:720:720.png?rcl=20251121230214E24F9DDCD03F26C16B11&rk3s=8e244e95&rrcfp=8a172a1a&x-expires=1764342135&x-signature=lhxnSygoyQ4Q94hwtRFirZ3LxAk%3D", quotes: ["多亏了你，成步堂先生！这个证据能帮上大忙的！刑警的直觉告诉我，这是真的！", "啊咧？我肚子饿了。不过，你的任务完成了，太好了，是吧！"] },
];