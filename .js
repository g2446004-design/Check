// DOM要素の取得
const categoriesContainer = document.getElementById('categories-container');
const addCategoryBtn = document.getElementById('add-category-btn');
const resetAllBtn = document.getElementById('reset-all-btn');

// アプリのデータ構造
let categories = loadCategories();

// --- データのロードと保存 ---

function loadCategories() {
    // 既存のロード/デフォルトデータロジックは前回と同じ
    const savedCategories = localStorage.getItem('checklistCategories');
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
    return savedCategories ? JSON.parse(savedCategories) : defaultCategories;
}

function saveCategories() {
    localStorage.setItem('checklistCategories', JSON.stringify(categories));
}

// --- カテゴリー/アイテムの描画処理 ---

// カテゴリーカード全体のHTMLを生成 (変更なし)
function createCategoryCard(category) {
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
            <label for="item-${item.id}" class="item-label" data-editable="item-name" data-category-id="${category.id}" data-item-id="${item.id}">${item.name}</label>
            <button class="delete-item-btn" data-category-id="${category.id}" data-item-id="${item.id}">×</button>
        </li>
    `).join('');

    // カテゴリータイトルに data-editable 属性を追加
    card.innerHTML = `
        <div class="category-header">
            <h2 class="category-title" data-editable="category-name" data-category-id="${category.id}">${category.name}</h2>
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

// 全カテゴリーを再描画する (変更なし)
function renderCategories() {
    categoriesContainer.innerHTML = '';
    categories.forEach(category => {
        categoriesContainer.appendChild(createCategoryCard(category));
    });
}

// 進捗バーの更新 (変更なし)
function updateCategoryCard(category) {
    const card = categoriesContainer.querySelector(`.category-card[data-category-id="${category.id}"]`);
    if (!card) return;
    const totalItems = category.items.length;
    const checkedItems = category.items.filter(item => item.checked).length;
    const progressPercentage = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

    card.querySelector('.progress-percent').textContent = `${progressPercentage}%`;
    card.querySelector('.progress-fill').style.width = `${progressPercentage}%`;
}


// --- 編集機能の追加ロジック ---

function handleEditStart(event) {
    const target = event.target;
    // data-editable 属性を持つ要素（カテゴリー名またはアイテム名）をダブルクリックした場合
    if (event.detail === 2 && target.dataset.editable) {
        // 現在のテキストを取得
        const currentText = target.textContent;
        
        // テキスト入力フィールドを作成
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.value = currentText;
        inputField.className = target.classList.contains('category-title') ? 'category-title-input' : 'item-label-input';
        
        // 元の要素を非表示にして入力フィールドを挿入
        target.style.display = 'none';
        target.parentNode.insertBefore(inputField, target.nextSibling);

        // フォーカスを当ててすぐに編集できるようにする
        inputField.focus();

        // 編集終了時の処理を設定
        inputField.addEventListener('blur', () => handleEditEnd(inputField, target));
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                inputField.blur(); // blurイベントが発火し、handleEditEndが実行される
            }
        });
    }
}

function handleEditEnd(inputField, targetElement) {
    const newText = inputField.value.trim();
    const isCategory = targetElement.dataset.editable === 'category-name';
    const id = parseInt(targetElement.dataset.categoryId || targetElement.dataset.itemId);

    if (newText && newText !== targetElement.textContent.trim()) {
        // データモデルを更新
        if (isCategory) {
            const category = categories.find(c => c.id === id);
            if (category) category.name = newText;
        } else {
            const categoryId = parseInt(targetElement.dataset.categoryId);
            const category = categories.find(c => c.id === categoryId);
            const item = category.items.find(i => i.id === id);
            if (item) item.name = newText;
        }
        
        // DOMと表示を更新
        targetElement.textContent = newText;
        saveCategories();
    }

    // 入力フィールドを削除し、元の要素を再表示
    inputField.parentNode.removeChild(inputField);
    targetElement.style.display = '';
}


// --- その他の既存イベントハンドラ (変更なし) ---

function handleCheckboxChange(event) {
    if (event.target.type === 'checkbox') {
        const categoryId = parseInt(event.target.dataset.categoryId);
        const itemId = parseInt(event.target.dataset.itemId);
        const isChecked = event.target.checked;
        const category = categories.find(c => c.id === categoryId);
        if (category) {
            const item = category.items.find(i => i.id === itemId);
            if (item) {
                item.checked = isChecked;
                updateCategoryCard(category);
                saveCategories();
            }
        }
    }
}

addCategoryBtn.addEventListener('click', () => {
    const newCategoryName = prompt("新しいカテゴリー名を入力してください:");
    if (newCategoryName) {
        const newCategory = { id: Date.now(), name: newCategoryName, items: [] };
        categories.push(newCategory);
        renderCategories();
        saveCategories();
    }
});

function handleAddItem(event) {
    if (event.target.classList.contains('add-item-btn')) {
        const categoryId = parseInt(event.target.dataset.categoryId);
        const newItemName = prompt("追加するアイテム名を入力してください:");

        if (newItemName) {
            const category = categories.find(c => c.id === categoryId);
            if (category) {
                const newItem = { id: Date.now(), name: newItemName, checked: false };
                category.items.push(newItem);
                renderCategories();
                saveCategories();
            }
        }
    }
}

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
            renderCategories();
            saveCategories();
        }
    }
}

resetAllBtn.addEventListener('click', () => {
    if (confirm("すべてのチェック状態を解除しますか？")) {
        categories.forEach(category => {
            category.items.forEach(item => {
                item.checked = false;
            });
        });
        renderCategories();
        saveCategories();
    }
});


// イベントリスナーを一括で設定
categoriesContainer.addEventListener('change', handleCheckboxChange);
categoriesContainer.addEventListener('click', handleAddItem);
categoriesContainer.addEventListener('click', handleDelete);
// 編集機能のためのダブルクリックイベントを追加
categoriesContainer.addEventListener('dblclick', handleEditStart);


// 初期描画
renderCategories();
