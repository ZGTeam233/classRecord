import {
    formatDate,
    getLastNDays,
    STUDENT_LIST,
    TOTAL_STUDENTS,
    STORAGE_KEY,
    NPC_DATA
} from "./utils.js";

// --- 3. 状态变量和 Chart 实例 ---
let currentData = {};
let dailyChart, historicalChart;

// --- 4. DOM 元素缓存 ---
const dom = {};

// --- 6. 数据持久化 ---

/** 从 localStorage 加载所有数据。*/
function loadAllData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    try {
        return stored ? JSON.parse(stored) : {};
    } catch (e) {
        console.error("Error parsing stored data, returning empty object:", e);
        return {};
    }
}

/** 保存当前日期的数据到 localStorage。*/
function saveCurrentData() {
    const selectedDate = dom.dateSelector.value;
    if (!selectedDate) return;

    const allData = loadAllData();
    allData[selectedDate] = currentData;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
}

// --- 7. 核心渲染和加载逻辑 ---

/** 加载并渲染特定日期的任务状态。*/
function loadAndRender(dateString) {
    const allData = loadAllData();
    const savedDayData = allData[dateString] || {};

    currentData = {};

    STUDENT_LIST.forEach(name => {
        currentData[name] = savedDayData[name] || { recitation: false, review: false };
    });

    renderTable();
    updateCharts(allData);
}

/** 渲染学生列表和复选框。*/
function renderTable() {
    dom.tableBody.innerHTML = '';

    STUDENT_LIST.forEach((name, index) => {
        const status = currentData[name];
        const row = dom.tableBody.insertRow();
        row.innerHTML = `
                <td>${index + 1}</td>
                <td>${name}</td>
                <td>
                    <label class="checkbox-container">
                        <input type="checkbox" data-student="${name}" data-task="recitation" ${status.recitation ? 'checked' : ''}>
                        <span class="checkmark"></span>
                    </label>
                </td>
                <td>
                    <label class="checkbox-container">
                        <input type="checkbox" class="review" data-student="${name}" data-task="review" ${status.review ? 'checked' : ''}>
                        <span class="checkmark review"></span>
                    </label>
                </td>
            `;
    });
    document.querySelectorAll('#tracker-table input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
    });
}

// --- 8. 图表和可视化 ---

/**
 * 初始化 Chart.js 实例。
 */
function initializeCharts(allData) {
    const dailyCtx = document.getElementById('daily-completion-chart').getContext('2d');
    const historicalCtx = document.getElementById('historical-trend-chart').getContext('2d');

    // 1. 当日完成率饼图 (Doughnut Chart)
    dailyChart = new Chart(dailyCtx, {
        type: 'doughnut',
        data: {
            labels: ['证物呈上', '证物缺失', '证言确认', '证言存疑'],
            datasets: [{
                data: [0, TOTAL_STUDENTS, 0, TOTAL_STUDENTS],
                backgroundColor: [
                    '#3b5998',      // 蓝色 (证物)
                    '#e0e0e0',      // 灰色 (缺失)
                    '#cc0000',      // 红色 (证言)
                    '#cccccc'       // 深灰色 (存疑)
                ],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { font: { family: 'var(--font-stardew)' } }
                },
                title: { display: false }
            }
        }
    });

    // 2. 历史趋势图 (Line Chart)
    historicalChart = new Chart(historicalCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: '证物呈上率 (%)',
                    data: [],
                    borderColor: '#3b5998',
                    backgroundColor: 'rgba(59, 89, 152, 0.2)',
                    tension: 0.2
                },
                {
                    label: '证言确认率 (%)',
                    data: [],
                    borderColor: '#cc0000',
                    backgroundColor: 'rgba(204, 0, 0, 0.2)',
                    tension: 0.2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    title: { display: true, text: '完成率 (%)' }
                }
            },
            plugins: {
                legend: { position: 'bottom' },
                title: { display: false }
            }
        }
    });

    updateCharts(allData);
}

/** * 计算并更新所有图表数据。
 * @param {object} allData 所有历史数据
 */
function updateCharts(allData) {
    if (!dailyChart || !historicalChart) return;

    // --- 1. 计算当日完成率 ---
    let recitationCompleted = 0;
    let reviewCompleted = 0;

    STUDENT_LIST.forEach(name => {
        if (currentData[name].recitation) recitationCompleted++;
        if (currentData[name].review) reviewCompleted++;
    });

    // Pie Chart Data - 直接使用学生数量
    dailyChart.data.datasets[0].data = [
        recitationCompleted,
        TOTAL_STUDENTS - recitationCompleted,
        reviewCompleted,
        TOTAL_STUDENTS - reviewCompleted
    ];
    dailyChart.update();

    // --- 2. 计算历史趋势图数据 ---
    const today = dom.dateSelector.value;
    const last7Days = getLastNDays(today, 7);
    const recitationRates = [];
    const reviewRates = [];

    last7Days.forEach(date => {
        const dayData = allData[date] || {};
        let rCount = 0;
        let rvCount = 0;

        STUDENT_LIST.forEach(name => {
            const status = dayData[name];
            if (status && status.recitation) rCount++;
            if (status && status.review) rvCount++;
        });

        // 计算百分比并保留一位小数
        const rRate = TOTAL_STUDENTS > 0 ? (rCount / TOTAL_STUDENTS) * 100 : 0;
        const rvRate = TOTAL_STUDENTS > 0 ? (rvCount / TOTAL_STUDENTS) * 100 : 0;

        recitationRates.push(parseFloat(rRate.toFixed(1)));
        reviewRates.push(parseFloat(rvRate.toFixed(1)));
    });

    // Line Chart Data
    historicalChart.data.labels = last7Days.map(d => d.substring(5)); // 显示 月-日 (M-D)
    historicalChart.data.datasets[0].data = recitationRates;
    historicalChart.data.datasets[1].data = reviewRates;
    historicalChart.update();
}

// --- 9. 角色对话功能 ---

function showNpcDialog(npcName, quote) {
    // 使用includes来匹配包含中文名的NPC
    const npc = NPC_DATA.find(n => n.name.includes(npcName.split('(')[0].trim()));
    if (!npc) {
        const defaultNpc = NPC_DATA.find(n => n.name.includes("法官"));
        dom.npcAvatar.src = defaultNpc.image;
        dom.npcName.textContent = defaultNpc.name;
        dom.npcQuote.textContent = "法庭相信你的判断！这个证据/证言将被记录在案！";
    } else {
        dom.npcAvatar.src = npc.image;
        dom.npcAvatar.alt = npc.name;
        dom.npcName.textContent = npc.name;
        dom.npcQuote.textContent = quote;
    }

    dom.npcDialogOverlay.classList.add('show');
}

window.hideNpcDialog = function() {
    dom.npcDialogOverlay.classList.remove('show');
}

function getRandomNpcComment() {
    const randomNpc = NPC_DATA[Math.floor(Math.random() * NPC_DATA.length)];
    const randomQuote = randomNpc.quotes[Math.floor(Math.random() * randomNpc.quotes.length)];
    return { name: randomNpc.name, quote: randomQuote };
}


// --- 10. 事件处理 ---

/** 处理单个复选框变化。*/
function handleCheckboxChange(event) {
    const checkbox = event.target;
    const studentName = checkbox.dataset.student;
    const task = checkbox.dataset.task;
    const isChecked = checkbox.checked;

    if (currentData[studentName]) {
        const previousState = currentData[studentName][task];
        currentData[studentName][task] = isChecked;

        saveCurrentData();
        updateCharts(loadAllData());

        if (isChecked && !previousState) {
            const { name, quote } = getRandomNpcComment();
            showNpcDialog(name, quote);
        }
    }
}

/**
 * 批量切换任务状态。
 */
function handleBatchToggle(taskType) {
    const checkboxes = document.querySelectorAll(`input[data-task="${taskType}"]`);

    const shouldCheckAll = Array.from(checkboxes).some(cb => !cb.checked);

    checkboxes.forEach(checkbox => {
        if (checkbox.checked !== shouldCheckAll) {
            checkbox.checked = shouldCheckAll;
            const studentName = checkbox.dataset.student;
            currentData[studentName][taskType] = shouldCheckAll;
        }
    });

    saveCurrentData();
    updateCharts(loadAllData());

    const taskName = taskType === 'recitation' ? '证物' : '证言';
    alert(`🚨 异议！法庭已下令，对所有学生的【${taskName}】执行${shouldCheckAll ? '呈上' : '清空'}！`);
}

// --- 11. 数据导入/导出 (卷宗管理) ---

/** 导出所有数据为 JSON 文件。*/
function exportData() {
    const allData = loadAllData();
    const jsonString = JSON.stringify(allData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    const fileName = `ace_attorney_case_file_${formatDate(new Date())}.json`;

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);

    alert("卷宗已成功导出为 " + fileName + "。请妥善保管！");
}

/** 导入 JSON 文件中的数据。*/
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (typeof importedData !== 'object' || Array.isArray(importedData)) {
                throw new Error("导入的卷宗格式不正确。");
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(importedData));

            const currentDay = dom.dateSelector.value;
            loadAndRender(currentDay);
            alert("法庭卷宗导入成功！所有记录已更新。");

        } catch (error) {
            console.error("卷宗导入失败:", error);
            alert("卷宗导入失败。请确保文件是有效的 JSON 格式。\n错误信息: " + error.message);
        }
    };
    reader.readAsText(file);
}


// --- 12. 初始化 ---

function initialize() {
    // 缓存 DOM 元素
    dom.dateSelector = document.getElementById('date-selector');
    dom.tableBody = document.getElementById('table-body');
    dom.npcDialogOverlay = document.getElementById('npc-dialog-overlay');
    dom.npcAvatar = document.getElementById('npc-avatar');
    dom.npcName = document.getElementById('npc-name');
    dom.npcQuote = document.getElementById('npc-quote');

    // 设置默认日期和最大日期
    const today = new Date();
    const todayString = formatDate(today);
    dom.dateSelector.value = todayString;
    dom.dateSelector.max = todayString;

    // 监听事件
    dom.dateSelector.addEventListener('change', (e) => loadAndRender(e.target.value));
    document.getElementById('batch-recitation-toggle').addEventListener('click', () => handleBatchToggle('recitation'));
    document.getElementById('batch-review-toggle').addEventListener('click', () => handleBatchToggle('review'));
    document.getElementById('export-data').addEventListener('click', exportData);
    document.getElementById('import-file').addEventListener('change', importData);

    // 首次加载和渲染
    const allData = loadAllData();
    loadAndRender(todayString);
    initializeCharts(allData);
}

// 页面加载完成后执行初始化
document.addEventListener('DOMContentLoaded', initialize);