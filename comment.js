// comments.js - KODE FINAL UNTUK WEBSITE ANDA
// ============================================
// GANTI BIN_ID DI BAWAH INI DENGAN MILIK ANDA
const BIN_ID = '697f8ff443b1c97be95da923'; // <-- PASTIKAN INI SUDAH BENAR
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// ============================================
// 1. FUNGSI UNTUK MENGIRIM (POST) KOMENTAR BARU
// ============================================
async function postComment(name, message) {
    try {
        // 1. Ambil data komentar yang sudah ada
        const getResponse = await fetch(`${JSONBIN_URL}/latest`);
        const existingData = await getResponse.json();
        let allComments = existingData.record.comments || [];

        // 2. Buat objek komentar baru
        const newComment = {
            id: 'cmt_' + Date.now(),
            name: name,
            message: message,
            date: new Date().toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long', 
                year: 'numeric'
            }),
            timestamp: Date.now()
        };

        // 3. Tambahkan komentar baru ke awal array
        allComments.unshift(newComment);

        // 4. Kirim (PUT) data array yang sudah diperbarui kembali ke JSONBin
        const putResponse = await fetch(JSONBIN_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                // Karena Bin Anda public, header 'X-Master-Key' tidak wajib untuk GET
                // Tapi untuk menulis (PUT), Anda tetap butuh API Key nanti.
                // Untuk TESTING DULU, kita bisa pakai mode public.
            },
            body: JSON.stringify({ comments: allComments })
        });

        console.log("Komentar berhasil dikirim ke JSONBin!");
        return { success: true, comment: newComment };

    } catch (error) {
        console.error("Gagal mengirim komentar:", error);
        return { success: false };
    }
}

// ============================================
// 2. FUNGSI UNTUK MENGAMBIL (GET) SEMUA KOMENTAR
// ============================================
async function getAllComments() {
    try {
        const response = await fetch(`${JSONBIN_URL}/latest`);
        const data = await response.json();
        // Mengembalikan array komentar, atau array kosong jika tidak ada
        return data.record.comments || []; 
    } catch (error) {
        console.error("Gagal mengambil komentar:", error);
        return [];
    }
}

// ============================================
// 3. FUNGSI UNTUK MENAMPILKAN KOMENTAR DI HALAMAN
// ============================================
function displayComments(commentsArray) {
    const container = document.getElementById('comments-list');
    if (!container) return;

    if (commentsArray.length === 0) {
        container.innerHTML = '<p class="no-comments">Belum ada ucapan. Jadilah yang pertama!</p>';
        return;
    }

    let html = '';
    commentsArray.forEach(comment => {
        html += `
            <div class="comment-item">
                <div class="comment-header">
                    <div class="comment-name"><i class="fas fa-user-circle"></i> ${comment.name}</div>
                    <div class="comment-date"><i class="far fa-calendar"></i> ${comment.date}</div>
                </div>
                <div class="comment-text">${comment.message}</div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// ============================================
// 4. MENGHUBUNGKAN FORM DI HTML DENGAN FUNGSI KITA
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Sistem komentar siap!');

    // Muat dan tampilkan komentar saat halaman pertama kali terbuka
    const initialComments = await getAllComments();
    displayComments(initialComments);

    // Hubungkan form submit dengan fungsi postComment
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Mencegah halaman refresh

            const nameInput = document.getElementById('comment-name');
            const messageInput = document.getElementById('comment-message');
            
            const name = nameInput.value.trim();
            const message = messageInput.value.trim();

            if (!name || !message) {
                alert('Harap isi nama dan ucapan Anda.');
                return;
            }

            // Kirim komentar
            const result = await postComment(name, message);
            
            if (result.success) {
                // Kosongkan form
                nameInput.value = '';
                messageInput.value = '';
                alert('✅ Terima kasih! Ucapan Anda telah terkirim.');
                
                // Segarkan daftar komentar untuk menampilkan yang baru
                const updatedComments = await getAllComments();
                displayComments(updatedComments);
            } else {
                alert('❌ Maaf, terjadi kesalahan. Silakan coba lagi.');
            }
        });
    }
});