// --- データ管理 ---

// ユニークID生成用の関数 (重複防止)
const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

// 初期データ
let checklistData = [
    {
        id: generateId(),
        name: "外出時の必需品",
        items: [
            { id: generateId(), name: "財布", checked: false },
            { id: generateId(), name: "スマートフォン", checked: false },
            { id: generateId(), name: "鍵", checked: false }
        ]
    },
    {
        id: generateId(),
        name: "仕事・学校",
        items: [
            { id: generateId(), name: "バッグ", checked: false },
            { id: generateId(), name: "ノートPC", checked: false },
            { id: generateId(), name: "充電器", checked: false },
            { id: generateId(), name: "筆記用具", checked: false },
            { id: generateId(), name: "書類", checked: false }
        ]
    }
];

const categoriesContainer = document.getElementById('categories-container');
const addCategoryBtn = document.getElementById('add-category-btn');
const resetAllBtn = document.getElementById('reset-all');

// --- 永続化 (ローカルストレージ) ---

/** データをローカルストレージに保存する */
function saveDataToLocalStorage() {
    localStorage.setItem('checklistData', JSON.stringify(checklistData));
}

/** ローカルストレージからデータを読み込む (初回起動時) */
function loadDataFromLocalStorage() {
    const storedData = localStorage.getItem('checklistData');
    if (storedData) {
        // データが存在する場合、上書きする
        checklistData = JSON.parse(storedData);
    }
}

// --- DOM操作と描画 ---

/**
 * データからカテゴリカードのHTML要素を作成する
 */
function createCategoryHTML(category) {
    const totalItems = category.items.length;
    const checkedItems = category.items.filter(item => item.checked).length;
    // 進捗率を計算 (アイテムがない場合は0%)
    const progress = totalItems === 0 ? 0 : Math.round((checkedItems / totalItems) * 100);

    const itemsHTML = category.items.map(item => `
        <li class="item-row" data-item-id="${item.id}">
            <label class="item-label">
                <input type="checkbox" ${item.checked ? 'checked' : ''} data-category-id="${category.id}" data-item-id="${item.id}">
                <span>${item.name}</span>
            </label>
            <button class="delete-item" data-category-id="${category.id}" data-item-id="${item.id}">&times;</button>
        </li>
    `).join('');

    return `
        <div class="category-card" data-category-id="${category.id}">
            <div class="category-header">
                <div class="category-title">${category.name}</div>
                <button class="delete-category" data-category-id="${category.id}">&times;</button>
            </div>

            <div class="progress-container">
                <div class="progress-text">
                    <span>進捗</span>
                    <span>${progress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%;"></div>
                </div>
            </div>

            <ul class="item-list">
                ${itemsHTML}
            </ul>

            <button class="add-item-btn" data-category-id="${category.id}">+ アイテムを追加</button>
        </div>
    `;
}

/**
 * 全てのカテゴリを再描画する
 */
function renderChecklist() {
    categoriesContainer.innerHTML = checklistData.map(createCategoryHTML).join('');
    // 描画が完了したら、状態を保存
    saveDataToLocalStorage();
}


// --- ロジック関数 ---

/** カテゴリ追加 */
function addCategory(categoryName) {
    const trimmedName = categoryName ? categoryName.trim() : '';
    if (trimmedName) {
        checklistData.push({
            id: generateId(), 
            name: trimmedName,
            items: []
        });
        renderChecklist();
    } else {
        alert("カテゴリ名を入力してください。");
    }
}

/** アイテムのチェック状態を切り替える */
function toggleItem(categoryId, itemId) {
    const category = checklistData.find(cat => cat.id === categoryId);
    if (category) {
        const item = category.items.find(it => it.id === itemId);
        if (item) {
            item.checked = !item.checked;
        }
    }
    renderChecklist();
}

/** カテゴリ内のアイテムを追加する */
function addItem(categoryId, itemName) {
    const category = checklistData.find(cat => cat.id === categoryId);
    const trimmedName = itemName ? itemName.trim() : '';

    if (category && trimmedName) {
        category.items.push({
            id: generateId(),
            name: trimmedName,
            checked: false
        });
        renderChecklist();
    } else {
        alert("アイテム名を入力してください。");
    }
}

/** カテゴリを削除する */
function deleteCategory(categoryId) {
    checklistData = checklistData.filter(cat => cat.id !== categoryId);
    renderChecklist();
}

/** 全てのチェック状態をリセットする */
function resetAllChecks() {
    checklistData.forEach(category => {
        category.items.forEach(item => {
            item.checked = false;
        });
    });
    renderChecklist();
}


// --- イベントリスナー ---

function setupEventListeners() {
    
    // カテゴリ追加ボタン
    addCategoryBtn.addEventListener('click', () => {
        const newCategoryName = prompt("新しいカテゴリ名を入力してください:");
        // キャンセルされた場合(null)も考慮してpromptの結果を渡す
        addCategory(newCategoryName); 
    });

    // すべてリセットボタン
    resetAllBtn.addEventListener('click', () => {
        if (confirm("全てのチェック状態をリセットしてもよろしいですか？")) {
            resetAllChecks();
        }
    });

    // イベント委譲：Categories Container内の動的な操作を処理
    categoriesContainer.addEventListener('click', (e) => {
        const target = e.target;
        
        // data-*属性はDOM操作で数値として扱われるように変換
        const categoryId = parseInt(target.dataset.categoryId);
        const itemId = parseInt(target.dataset.itemId);

        if (target.matches('input[type="checkbox"]')) {
            toggleItem(categoryId, itemId);
        } else if (target.matches('.delete-item')) {
            deleteItem(categoryId, itemId);
        } else if (target.matches('.delete-category')) {
            if (confirm(`「${target.parentElement.querySelector('.category-title').textContent}」カテゴリを削除してもよろしいですか？`)) {
                 deleteCategory(categoryId);
            }
        } else if (target.matches('.add-item-btn')) {
            const newItemName = prompt("追加するアイテム名を入力してください:");
            addItem(categoryId, newItemName);
        }
    });
}

// --- アプリの初期化 ---
document.addEventListener('DOMContentLoaded', () => {
    loadDataFromLocalStorage(); 
    renderChecklist();          
    setupEventListeners();      
});
