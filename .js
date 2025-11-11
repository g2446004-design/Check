// 1. 必要なHTML要素を取得する
const addButton = document.getElementById('add-button');
const itemNameInput = document.getElementById('item-name');
const itemCategorySelect = document.getElementById('item-category');
const checklist = document.getElementById('checklist');

// 2. 「追加」ボタンがクリックされた時の処理を設定する
addButton.addEventListener('click', () => {
    // 3. 入力された値を取得する
    const itemName = itemNameInput.value;
    const category = itemCategorySelect.value;
    const categoryText = itemCategorySelect.options[itemCategorySelect.selectedIndex].text; // 選択肢の表示名

    // 入力欄が空の場合は何もしない
    if (itemName === "") {
        alert("項目名を入力してください。");
        return; 
    }

    // 4. 新しいリスト要素(li)を作成する
    const listItem = document.createElement('li');
    
    // データ属性としてカテゴリー情報を持たせる (CSSでの色分けなどに便利)
    listItem.dataset.category = category; 

    // リスト要素の中身 (HTML) を作成
    listItem.innerHTML = `
        <input type="checkbox">
        <span class="item-name">${itemName}</span>
        <span class="category-badge">${categoryText}</span>
    `;

    // 5. 作成したリスト要素を checklist (ul) に追加する
    checklist.appendChild(listItem);

    // 6. 入力欄をクリアする
    itemNameInput.value = "";
});
