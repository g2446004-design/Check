// 初期データ構造
let checklistData = [
    {
        id: Date.now() + 1,
        name: "外出時の必需品",
        items: [
            { id: Date.now() + 2, name: "財布", checked: false },
            { id: Date.now() + 3, name: "スマートフォン", checked: false },
            { id: Date.now() + 4, name: "鍵", checked: false }
        ]
    },
    {
        id: Date.now() + 5,
        name: "仕事・学校",
        items: [
            { id: Date.now() + 6, name: "バッグ", checked: false },
            { id: Date.now() + 7, name: "ノートPC", checked: false },
            { id: Date.now() + 8, name: "充電器", checked: false },
            { id: Date.now() + 9, name: "筆記用具", checked: false },
            { id: Date.now() + 10, name: "書類", checked: false }
        ]
    }
];

const categoriesContainer = document.getElementById('categories-container');
const addCategoryBtn = document.getElementById('add-category-btn');
const resetAllBtn = document.getElementById('reset-all');

/**
 * データからカテゴリカードのHTML要素を作成する
 * @param {Object} category - カテゴリデータオブジェクト
 * @returns {string} - カテゴリカードのHTML文字列
 */
function createCategoryHTML(category) {
    const totalItems = category.items.length;
    const checkedItems = category.items.filter(item => item.checked).length;
    const progress = totalItems === 0 ? 0 : Math.round((checkedItems / totalItems) * 100);

    // アイテムリストのHTMLを作成
    const itemsHTML = category.items.map(item => `
        <li class="item-row" data-item-id="${item.id}">
            <label class="item-label">
                <input type="checkbox" ${item.checked ? 'checked' : ''} data-category-id="${category.id}" data-item-id="${item.id}">
                ${item.name}
            </label>
            <button class="delete-item" data-category-id="${category.id}" data-item-id="${item.id}">&times;</button>
        </li>
    `).join('');

    // カテゴリカード全体のHTML
    return `
        <div class="category-card" data-category-id="${category.id}">
            <div class="category-header">
                <div class="category-title">${category.name}</div>
                <button class="delete-category" data-category-id="${category.id}">&times;</button>
            </div>

            <div class="progress-container">
                <div class="progress-text">進捗 ${progress}%</div>
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
}

/**
 * チェックボックスの状態を更新し、再描画する
 * @param {number} categoryId - カテゴリID
 * @param {number} itemId - アイテムID
 */
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

/**
 * アイテムをカテゴリに追加する
 * @param {number} categoryId - カテゴリID
 * @param {string} itemName - 追加するアイテム名
 */
function addItem(categoryId, itemName) {
    const category = checklistData.find(cat => cat.id === categoryId);
    if (category && itemName) {
        category.items.push({
            id: Date.now(),
            name: itemName,
            checked: false
        });
        renderChecklist();
    }
}

/**
 * 新しいカテゴリを追加する
 */
function addCategory(categoryName) {
    if (categoryName) {
        checklistData.push({
            id: Date.now(),
            name: categoryName,
            items: []
        });
        renderChecklist();
    }
}

/**
 * アイテムを削除する
 * @param {number} categoryId - カテゴリID
 * @param {number} itemId - アイテムID
 */
function deleteItem(categoryId, itemId) {
    const category = checklistData.find(cat => cat.id === categoryId);
    if (category) {
        category.items = category.items.filter(item => item.id !== itemId);
    }
    renderChecklist();
}

/**
 * カテゴリを削除する
 * @param {number} categoryId - カテゴリID
 */
function deleteCategory(categoryId) {
    checklistData = checklistData.filter(cat => cat.id !== categoryId);
    renderChecklist();
}

/**
 * イベントリスナーのセットアップ
 */
function setupEventListeners() {
    // カテゴリ追加ボタン
    addCategoryBtn.addEventListener('click', () => {
        const newCategoryName = prompt("新しいカテゴリ名を入力してください:");
        if (newCategoryName) {
            addCategory(newCategoryName.trim());
        }
    });

    // すべてリセットボタン
    resetAllBtn.addEventListener('click', () => {
        if (confirm("全てのチェック状態をリセットしてもよろしいですか？")) {
            checklistData.forEach(category => {
                category.items.forEach(item => {
                    item.checked = false;
                });
            });
            renderChecklist();
        }
    });

    // チェックボックス、アイテム追加、削除のイベントを処理（イベント委譲）
    categoriesContainer.addEventListener('click', (e) => {
        const target = e.target;

        // 1. アイテムのチェック/アンチェック
        if (target.matches('input[type="checkbox"]')) {
            const categoryId = parseInt(target.dataset.categoryId);
            const itemId = parseInt(target.dataset.itemId);
            toggleItem(categoryId, itemId);
        }

        // 2. アイテムの削除
        else if (target.matches('.delete-item')) {
            const categoryId = parseInt(target.dataset.categoryId);
            const itemId = parseInt(target.dataset.itemId);
            deleteItem(categoryId, itemId);
        }

        // 3. カテゴリの削除
        else if (target.matches('.delete-category')) {
            const categoryId = parseInt(target.dataset.categoryId);
            if (confirm(`「${target.parentElement.querySelector('.category-title').textContent}」カテゴリを削除してもよろしいですか？`)) {
                 deleteCategory(categoryId);
            }
        }

        // 4. アイテム追加ボタン（カテゴリ内）
        else if (target.matches('.add-item-btn')) {
            const categoryId = parseInt(target.dataset.categoryId);
            const newItemName = prompt("追加するアイテム名を入力してください:");
            if (newItemName) {
                addItem(categoryId, newItemName.trim());
            }
        }
    });
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    // データをローカルストレージから読み込む（省略、今回はメモリ内データを使用）
    renderChecklist();
    setupEventListeners();
});

// // 補足：ローカルストレージを使用する場合
// function loadData() {
//     const storedData = localStorage.getItem('checklistData');
//     if (storedData) {
//         checklistData = JSON.parse(storedData);
//     }
// }

// function saveData() {
//     localStorage.setItem('checklistData', JSON.stringify(checklistData));
// }

// // renderChecklistの最後にsaveData()を追加し、初期化時にloadData()を呼び出します