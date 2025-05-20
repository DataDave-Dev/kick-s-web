document.addEventListener('DOMContentLoaded', function () {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => {
                btn.classList.remove('border-red-500', 'text-red-600');
                btn.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
            });

            tabContents.forEach(content => {
                content.classList.add('hidden');
                content.classList.remove('block');
            });

            button.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
            button.classList.add('border-red-500', 'text-red-600');

            const tabId = button.id.replace('tab-', 'content-');
            document.getElementById(tabId).classList.remove('hidden');
            document.getElementById(tabId).classList.add('block');
        });
    });

    const modal = document.getElementById('modal-upload-photo');
    const openBtn = document.getElementById('open-modal');
    const closeBtn = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-upload');
    const confirmBtn = document.getElementById('confirm-upload');
    const fileInput = document.getElementById('file-input');
    const previewImg = document.getElementById('preview-image');
    const avatarImg = document.querySelector('img[alt="Avatar de usuario"]');

    openBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    cancelBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        fileInput.value = "";
        previewImg.src = "";
        previewImg.classList.add('hidden');
    });

    fileInput.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                previewImg.src = e.target.result;
                previewImg.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    confirmBtn.addEventListener('click', async () => {
        const file = fileInput.files[0];
        if (!file) {
            alert("Selecciona una imagen antes de continuar.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/user/uploadAvatar", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Error al subir la imagen");
            }

            fileInput.value = "";
            previewImg.src = "";
            previewImg.classList.add('hidden');
            modal.classList.add('hidden');

            location.reload();

        } catch (error) {
            console.error("Error al subir imagen:", error);
            alert("Ocurrió un error al subir la imagen.");
        }
    });
});