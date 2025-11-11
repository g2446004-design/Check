// DOM読み込み後に実行
document.addEventListener('DOMContentLoaded', () => {

    // --- 要素の取得 ---
    // ※ 複数のカードに対応するため、コンテナを基準にします
    const cardContainer = document.getElementById('card-container');
    const resetAllBtn = document.getElementById('reset-all-btn');

    // --- イベントリスナーの設定 ---

    // カードコンテナ全体でイベントを監視（イベント委任）
    cardContainer.addEventListener('click', (e) => {
        // 「アイテムを追加」ボタンが押された場合
        if (e.target.classList.contains('add-item-btn')) {
            // e.target (押されたボタン) の親 (div.add-item-form) の
            // 兄 (ul.item-list) と
            // 弟 (input.item-input) を見つける
            const card = e.target.closest('.category-card');
            const input = card.querySelector('.item-input');
            const itemList = card.querySelector('.item-list');
            
            if (input.value.trim() !== "") {
                addItem(input.value, itemList);
                input.value = ""; // 入力欄をクリア
                updateProgress(card); // 進捗を更新
            }
        }

        // 「アイテム削除」ボタンが押された場合
        if (e.target.classList.contains('delete-item-btn')) {
            const item = e.target.closest('li');
            const card = e.target.closest('.category-card');
            item.remove(); // アイテム(li)を削除
            updateProgress(card); // 進捗を更新
        }
        
        // 「カテゴリ削除」ボタンが押された場合
        if (e.target.classList.contains('delete-card-btn')) {
            const card = e.target.closest('.category-card');
            if (confirm(`「${card.querySelector('h3').textContent}」を削除しますか？`)) {
                card.remove(); // カード自体を削除
            }
        }
    });

    // カードコンテナ内のチェックボックスが変更された場合
    cardContainer.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            const card = e.target.closest('.category-card');
            updateProgress(card); // 進捗を更新
        }
    });

    // 「すべてリセット」ボタンが押された場合
    resetAllBtn.addEventListener('click', () => {
        const allCheckboxes = document.querySelectorAll('.item-list input[type="checkbox"]');
        allCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // すべてのカードの進捗を更新
        const allCards = document.querySelectorAll('.category-card');
        allCards.forEach(card => {
            updateProgress(card);
        });
    });


    // --- 関数定義 ---

    /**
     * リストに新しいアイテムを追加する関数
     * @param {string} text - アイテムのテキスト
     * @param {HTMLElement} itemList - 追加先のul要素
     */
    function addItem(text, itemList) {
        // 新しいli要素を作成
        const li = document.createElement('li');
        
        // liの中身のHTMLを作成
        li.innerHTML = `
            <input type="checkbox">
            <span>${escapeHTML(text)}</span>
            <button class="delete-item-btn">×</button>
        `;
        
        // ul (itemList) に li を追加
        itemList.appendChild(li);
    }

    /**
     * 特定のカードの進捗バーを更新する関数
     * @param {HTMLElement} card - 対象のカテゴリカード
     */
    function updateProgress(card) {
        const checkboxes = card.querySelectorAll('.item-list input[type="checkbox"]');
        const progressBar = card.querySelector('.progress-bar');
        
        const total = checkboxes.length;
        if (total === 0) {
            progressBar.value = 0;
            return;
        }
        
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        const percentage = (checkedCount / total) * 100;
        
        progressBar.value = percentage;
    }

    /**
     * HTMLエスケープ（XSS対策）
     * @param {string} str - エスケープする文字列
     */
    function escapeHTML(str) {
        return str.replace(/[&<>"']/g, function(match) {
            return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
            }[match];
        });
    }

    // --- 初期実行 ---
    // ページ読み込み時に、既存のカード（HTMLに書いた例）の進捗を初期化
    const initialCards = document.querySelectorAll('.category-card');
    initialCards.forEach(card => updateProgress(card));
});
