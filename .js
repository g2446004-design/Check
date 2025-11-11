// DOM要素の取得
const categoriesContainer = document.getElementById('categories-container');
const addCategoryBtn = document.getElementById('add-category-btn');
const resetAllBtn = document.getElementById('reset-all-btn');

// アプリのデータ構造
let categories = loadCategories();

// --- データのロードと保存 ---

function loadCategories() {
    const savedCategories = localStorage.getItem('checklistCategories');
    // デフォルトデータを設定
    const defaultCategories = [
        {
            id: Date.now() + 1,
            name: "外出時の必需品",
            items: [
                { id: Date.now() + 2, name: "財布", checked: false },
                { id: Date.now() + 3, name: "スマートフォン", checked: false },
                { id: Date.now() + 4, name: "鍵", checked: false },
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
                { id: Date.now() + 10, name: "書類", checked: false },
            ]
        }
    ];

    // ローカルストレージにデータがあればそれを使い、なければデフォルトデータを使う
    return savedCategories ? JSON.parse(savedCategories) : defaultCategories;
}

function saveCategories() {
    localStorage.setItem('checklistCategories', JSON.stringify(categories));
}

// --- カテゴリー/アイテムの描画処理 ---

// カテゴリーカード全体のHTMLを生成
function createCategoryCard(category) {
    // カテゴリーカードのDOM要素を作成
    const card = document.createElement('div');
    card.className = 'category-card';
    card.dataset.categoryId = category.id;

    // 進捗計算
    const totalItems = category.items.length;
    const checkedItems = category.items.filter(item => item.checked).length;
    const progressPercentage = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

    // アイテムリストのHTML文字列を生成
    const itemListHtml = category.items.map(item => `
        <li class="item" data-item-id="${item.id}">
            <input type="checkbox" id="item-${item.id}" ${item.checked ? 'checked' : ''} data-category-id="${category.id}" data-item-id="${item.id}">
            <label for="item-${item.id}" class="item-label">${item.name}</label>
            <button class="delete-item-btn" data-category-id="${category.id}" data-item-id="${item.id}">×</button>
        </li>
    `).join('');

    card.innerHTML = `
        <div class="category-header">
            <h2 class="category-title">${category.name}</h2>
            <button class="delete-category-btn" data-category-id="${category.id}">×</button>
        </div>
        
        <div class="progress-bar-container">
            <div class="progress-info">
                <span>進捗</span>
                <span class="progress-percent">${progressPercentage}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progressPercentage}%"></div>
            </div>
        </div>

        <ul class="item-list">
            ${itemListHtml}
        </ul>

        <button class="add-item-btn" data-category-id="${category.id}">+ アイテムを追加</button>
    `;

    return card;
}

// 全カテゴリーを再描画する
function renderCategories() {
    categoriesContainer.innerHTML = '';
    categories.forEach(category => {
        categoriesContainer.appendChild(createCategoryCard(category));
    });
}

// 特定のカテゴリーのみを更新 (進捗バーの更新に使う)
function updateCategoryCard(category) {
    const card = categoriesContainer.querySelector(`.category-card[data-category-id="${category.id}"]`);
    if (!card) return;

    const totalItems = category.items.length;
    const checkedItems = category.items.filter(item => item.checked).length;
    const progressPercentage = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

    card.querySelector('.progress-percent').textContent = `${progressPercentage}%`;
    card.querySelector('.progress-fill').style.width = `${progressPercentage}%`;
}


// --- イベントハンドラ ---

// チェックボックスの状態変更
function handleCheckboxChange(event) {
    if (event.target.type === 'checkbox') {
        const categoryId = parseInt(event.target.dataset.categoryId);
        const itemId = parseInt(event.target.dataset.itemId);
        const isChecked = event.target.checked;

        // データ更新
        const category = categories.find(c => c.id === categoryId);
        if (category) {
            const item = category.items.find(i => i.id === itemId);
            if (item) {
                item.checked = isChecked;
                updateCategoryCard(category); // 進捗を更新
                saveCategories(); // 保存
            }
        }
    }
}

// 新しいカテゴリーを追加
addCategoryBtn.addEventListener('click', () => {
    const newCategoryName = prompt("新しいカテゴリー名を入力してください:");
    if (newCategoryName) {
        const newCategory = {
            id: Date.now(),
            name: newCategoryName,
            items: []
        };
        categories.push(newCategory);
        renderCategories(); // 全再描画
        saveCategories();
    }
});

// アイテムを追加
function handleAddItem(event) {
    if (event.target.classList.contains('add-item-btn')) {
        const categoryId = parseInt(event.target.dataset.categoryId);
        const newItemName = prompt("追加するアイテム名を入力してください:");

        if (newItemName) {
            const category = categories.find(c => c.id === categoryId);
            if (category) {
                const newItem = { id: Date.now(), name: newItemName, checked: false };
                category.items.push(newItem);
                renderCategories(); // 全再描画して新しいアイテムを表示
                saveCategories();
            }
        }
    }
}

// カテゴリーまたはアイテムを削除
function handleDelete(event) {
    if (event.target.classList.contains('delete-category-btn')) {
        const categoryId = parseInt(event.target.dataset.categoryId);
        if (confirm(`カテゴリー「${categories.find(c => c.id === categoryId).name}」を削除しますか？`)) {
            categories = categories.filter(c => c.id !== categoryId);
            renderCategories();
            saveCategories();
        }
    } else if (event.target.classList.contains('delete-item-btn')) {
        const categoryId = parseInt(event.target.dataset.categoryId);
        const itemId = parseInt(event.target.dataset.itemId);

        const category = categories.find(c => c.id === categoryId);
        if (category) {
            category.items = category.items.filter(i => i.id !== itemId);
            renderCategories(); // 全再描画
            saveCategories();
        }
    }
}

// すべてリセット
resetAllBtn.addEventListener('click', () => {
    if (confirm("すべてのチェック状態を解除しますか？\n（アイテムやカテゴリー自体は削除されません）")) {
        categories.forEach(category => {
            category.items.forEach(item => {
                item.checked = false;
            });
        });
        renderCategories();
        saveCategories();
    }
});


// イベントリスナーを一括で設定（動的に生成される要素に対応するため）
categoriesContainer.addEventListener('change', handleCheckboxChange);
categoriesContainer.addEventListener('click', handleAddItem);
categoriesContainer.addEventListener('click', handleDelete);


// 初期描画
renderCategories();
