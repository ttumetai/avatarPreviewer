const { createApp, ref } = Vue;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) throw new Error("不支持的文件格式，请上传 JPG、PNG、GIF 或 WebP");
  if (file.size > MAX_SIZE) throw new Error("文件过大，最大支持 10MB");
}

const app = createApp({
  setup() {
    // Avatar
    const imageLoaded = ref(false);
    const imageUrl = ref("");
    const isDragOver = ref(false);
    const fileInput = ref(null);

    // Background
    const bgImageLoaded = ref(false);
    const bgImageUrl = ref("");
    const bgDragOver = ref(false);
    const bgFileInput = ref(null);
    const bgExpanded = ref(false);

    // ===== Avatar =====
    function triggerFileInput() {
      fileInput.value?.click();
    }

    function handleDrop(e) {
      isDragOver.value = false;
      const file = e.dataTransfer?.files[0];
      if (file) openCropper(file, 1); // 1 = square
    }

    function handleFileSelect(e) {
      const file = e.target.files[0];
      if (file) openCropper(file, 1);
      e.target.value = '';
    }

    function openCropper(file, aspect) {
      try {
        validateFile(file);
      } catch (err) {
        alert(err.message);
        return;
      }
      window.ImageCropper.open({
        file,
        aspect,
        onConfirm(dataUrl) {
          if (aspect === 1) {
            imageUrl.value = dataUrl;
            imageLoaded.value = true;
          } else {
            bgImageUrl.value = dataUrl;
            bgImageLoaded.value = true;
          }
        },
      });
    }

    // ===== Background =====
    function triggerBgInput() {
      bgFileInput.value?.click();
    }

    function handleBgDrop(e) {
      bgDragOver.value = false;
      const file = e.dataTransfer?.files[0];
      if (file) openCropper(file, null); // null = free
    }

    function handleBgFileSelect(e) {
      const file = e.target.files[0];
      if (file) openCropper(file, null);
      e.target.value = '';
    }

    function clearBgImage() {
      bgImageLoaded.value = false;
      bgImageUrl.value = "";
    }

    return {
      imageLoaded, imageUrl, isDragOver, fileInput,
      triggerFileInput, handleDrop, handleFileSelect,
      bgImageLoaded, bgImageUrl, bgDragOver, bgFileInput, bgExpanded,
      triggerBgInput, handleBgDrop, handleBgFileSelect, clearBgImage,
    };
  },
});

app.mount("#app");
