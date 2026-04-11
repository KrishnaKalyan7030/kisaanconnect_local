document.addEventListener("DOMContentLoaded", function () {

  // 🎥 Video Data
  const videos = [
    {
      src: "assets/videos/farmer1.mp4",
      title: "शेतकरी यशोगाथा",
      duration: "2:15"
    },
    {
        src:"assets/videos/adv.mp4",
        title:"शिल्पा शेट्टी",
        duration:"0.45"
    }
 
  ];

  // 🔢 State
  let currentIndex = 0;

  // 🎯 Elements
  const mainVideo = document.getElementById("main-video");
  const title = document.getElementById("video-title");
  const duration = document.getElementById("video-duration");
  const playlist = document.getElementById("playlist");
  const playBtn = document.getElementById("play-btn");

  // ▶️ Load Video
  function loadVideo(index) {
    const video = videos[index];
    mainVideo.src = video.src;
    title.innerText = video.title;
    duration.innerText = video.duration;
  }

  // ⏭ Next
  function nextVideo() {
    currentIndex = (currentIndex + 1) % videos.length;
    loadVideo(currentIndex);
  }

  // ⏮ Prev
  function prevVideo() {
    currentIndex = (currentIndex - 1 + videos.length) % videos.length;
    loadVideo(currentIndex);
  }

  // ⏯ Play / Pause
  function togglePlay() {
    if (mainVideo.paused) {
      mainVideo.play();
      playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
      mainVideo.pause();
      playBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
  }

  // 📋 Playlist
  function renderPlaylist() {
    playlist.innerHTML = "";

    videos.forEach((video, index) => {
      const item = document.createElement("div");

      item.className =
        "p-3 bg-white/10 rounded-xl cursor-pointer hover:bg-white/20 text-white";

      item.innerHTML = `
        <p class="font-medium">${video.title}</p>
        <p class="text-sm text-emerald-200">${video.duration}</p>
      `;

      item.onclick = () => {
        currentIndex = index;
        loadVideo(index);
      };

      playlist.appendChild(item);
    });
  }

  // 🔄 Auto play next
  mainVideo.addEventListener("ended", nextVideo);

  // 🚀 Init
  loadVideo(currentIndex);
  renderPlaylist();

  // 🌐 Make functions global (for buttons)
  window.nextVideo = nextVideo;
  window.prevVideo = prevVideo;
  window.togglePlay = togglePlay;

});