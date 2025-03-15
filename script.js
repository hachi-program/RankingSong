// Firebaseのセットアップ
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Firebase コンソールからコピーした設定
const firebaseConfig = {
    apiKey: "AIzaSyAVUKIFhGAtOw5TMVC5yNBrt8qM1y-lomU",
    authDomain: "song-ranking-list.firebaseapp.com",
    projectId: "song-ranking-list",
    storageBucket: "song-ranking-list.firebasestorage.app",
    messagingSenderId: "562126819391",
    appId: "1:562126819391:web:d218570aab291c4359a88a"
  };

// FirebaseアプリとFirestoreを初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.getElementById("add-song-btn").addEventListener("click", addSong);
document.getElementById("decade").addEventListener("change", fetchRanking);

// 曲をデータベースに追加
async function addSong() {
    const decade = document.getElementById("new-decade").value;
    const song = document.getElementById("new-song").value.trim();
    const selectAgeMsg = "年代を選択してください！";
    const inputSongMsg = "曲名を入力してください！";
    const addSongMsg = "曲を追加しました！";

    if (decade == 0) return alert(selectAgeMsg);
    if (!song) return alert(inputSongMsg);

    const songRef = doc(db, "songs", `${song}_${decade}`);
    const songSnap = await getDoc(songRef);

    if (songSnap.exists()) {
        // 既に登録されている場合、カウントを増やす
        await updateDoc(songRef, { count: songSnap.data().count + 1 });
    } else {
        // 新しい曲の場合、データを作成
        await setDoc(songRef, { decade, song, count: 1 });
    }

    showNotification(addSongMsg);
    document.getElementById("new-song").value = "";
    fetchRanking(); // ランキングを更新
}

// ランキングを取得
// 指定した年代のランキングを取得して表示
async function fetchRanking() {
    const rankingList = document.getElementById("ranking-list");
    rankingList.innerHTML = ""; // リストをクリア
    const selectedDecade = document.getElementById("decade").value; // 選択した年代

    // Firestore から指定した年代の曲のみ取得（count の多い順）
    const q = query(
        collection(db, "songs"),
        where("decade", "==", selectedDecade), // 選択した年代のみ
        orderBy("count", "desc"),
        limit(10)
    );

    const querySnapshot = await getDocs(q);

    // 取得したデータをリストに追加
    querySnapshot.forEach(doc => {
        const data = doc.data();
        const li = document.createElement("li");
        li.classList.add("song-item"); // クラスを追加（CSSで調整）
    
        // 曲名の要素
        const songText = document.createElement("span");
        songText.textContent = data.song;
    
        // 追加回数の要素
        const countSpan = document.createElement("span");
        countSpan.textContent = `${data.count}人`;
        countSpan.classList.add("count"); // クラスを追加（CSSで調整）
    
        // 曲名と追加回数を li に追加
        li.appendChild(songText);
        li.appendChild(countSpan);
        rankingList.appendChild(li);
    });
}

// 
function showNotification(message) {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.classList.add("show");

    setTimeout(() => {
        notification.classList.remove("show");
    }, 3000); // 3秒後に消える
}


// 初回表示
fetchRanking();
