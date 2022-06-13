const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY = "App_Music";

const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const cd = $(".cd");
const playBtn = $(".btn-toggle-play");
const player = $(".player");
const playList = $(".playlist");
const progess = $(".progress");
const btnNext = $(".btn-next");
const btnPrev = $(".btn-prev");
const btnRandom = $(".btn-random");
const btnRepeat = $(".btn-repeat");
const songItem = $(".song");


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    arrNum: [0],
    // config là lấy dữ liệu đã lưu, setconfig là lưu dữ liệu của ứng dụng 
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    song: [
        {
            name: "Đóa quỳnh lan",
            singer: "H2k ft Yuni Boo",
            path: "./assests/song/DoaQuynhLan.mp3",
            image: "./assests/img/doaquynhlan.jpg" 
        },{
            name: "Nếu có kiếp sau",
            singer: "Hương Ly",
            path: "./assests/song/NeuCoKiepSau.mp3",
            image: "./assests/img/neucokiepsau.jpg" 
        },
        {
            name: "Phận duyên lỡ làng",
            singer: " PHÁT HUY T4 X TRUZG",
            path: "./assests/song/PhanDuyenLoLang.mp3",
            image: "./assests/img/PhanDuyenLoLang.jpg" 
        },
        {
            name: "Thê lương",
            singer: "PHÚC CHINH ",
            path: "./assests/song/TheLuong.mp3",
            image: "./assests/img/theluong.jpg" 
        },
        {
            name: "Cảm ơn vì tất cả",
            singer: "Anh Quân Idol x Haky ",
            path: "./assests/song/camonvitatca.mp3",
            image: "./assests/img/camonvitatca.jpg" 
        },
        {
            name: "Hoa nở không màu",
            singer: "Hoài Lâm",
            path: "./assests/song/hoanokhongmau.mp3",
            image: "./assests/img/hoanokhongmau.jpg" 
        },
        {
            name: "Tướng quân",
            singer: "Nhật Phong",
            path: "./assests/song/tuongquan.mp3",
            image: "./assests/img/tuongquan.jpg" 
        },
        {
            name: "Vu quy",
            singer: "199X (KAISOUL - PHÚC PIN) FT. DJ KUTI | LONG NÓN LÁ x MISABAE",
            path: "./assests/song/vuquy.mp3",
            image: "./assests/img/vyquy.jpg" 
        },
    ],
    // Hàm hiển thị thông tin bài hát lên danh sách
    render: function() {
        const htmls = this.song.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex? "active": ""}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>`
        });
        playList.innerHTML = htmls.join("");
    },

    defienProperties: function() {
        Object.defineProperty(this, "currentSong", {
            get: function() {
                return this.song[this.currentIndex];
            }
        });
    },

    handleEvants: function() {
        // Xử lý quay CD
        const cdThumbAnimate = cdThumb.animate([
            { transform: "rotate(360deg)"}
        ], {
            duration: 10000,
            iterations: Infinity,
        });
        cdThumbAnimate.pause();

        // Phóng to, thu nhỏ CD
        const cdWidth = cd.offsetWidth;
        document.onscroll = function() {
            const scrollTop = window.scrollY ||document.documentElement.scrollY;
            if(scrollTop === undefined) {
                cd.style.width = cdWidth;
            }else {
                const newWidth = cdWidth - scrollTop;
                cd.style.width = newWidth > 0 ? newWidth+"px" : 0;
                cd.style.opacity = newWidth/cdWidth;
            }
        }

        // Xử lí phi Play
        playBtn.onclick = function() {
            if(app.isPlaying) {
                audio.pause();
            }else {  
                audio.play(); 
            }   
        };
        // khi nhạc chơi
        audio.onplay = function() {
            app.isPlaying = true;
            cdThumbAnimate.play();
            player.classList.add("playing");
            app.render();
            app.setConfig("indexSong", app.currentIndex);
        };
        // khi nhạc dừng
        audio.onpause = function() {
            app.isPlaying = false;
            cdThumbAnimate.pause();  
            player.classList.remove("playing");
        };
        // Thanh seek tăng theo thời gian bài hát
        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progessPrecent = Math.floor(audio.currentTime / audio.duration *100);
                progess.value = progessPrecent;
            }
        };
        //Xử lí khi tua
        progess.oninput = function() {
            const seekTime = audio.duration / 100 * progess.value;
            audio.currentTime = seekTime;
        };
        // Xử lý ấn qua bài kế tiếp 
        btnNext.onclick = function() {
            if(app.isRandom) {
                app.playRandomSong();
            }else {
                app.nextSong();
            }
            audio.play();
        };

        // Xử lý khi ấn quay lại bài hát trước đó
        btnPrev.onclick = function() {
            if(app.isRandom) {
                app.playRandomSong();
            }else {
                app.prevSong();
            }
            audio.play();
        };

        // Xử lý khi nhấn random
        btnRandom.onclick = function() {
            app.isRandom = !app.isRandom;
            app.setConfig("isRandom", app.isRandom);
            btnRandom.classList.toggle("active", app.isRandom);
        };

        // Xử lý qua bài mới khi hết bài hát hiện tại và lặp lại bài hát khi nhấn nút repeat
        audio.onended = function() {
            if(app.isRepeat) {
                audio.play();
            }else {
                btnNext.click();
            }
        };

        // Xử lý Repeat 
        btnRepeat.onclick = function() {
            app.isRepeat = !app.isRepeat;
            app.setConfig("isRepeat", app.isRepeat);
            btnRepeat.classList.toggle("active", app.isRepeat);
        };

        // Bắt sự kiện khi người dùng chọn bài hát trong play list
        // closest gọi chính nó hoặc parent
        playList.onclick = function(e) {
            if(e.target.closest(".option")) {
                console.log("Chưa làm chức năng của bài: ", e.target.closest(".song").dataset.index);
            }else if(e.target.closest(".song:not(.active)")) {
                app.currentIndex = Number(e.target.closest(".song:not(.active)").dataset.index);
                app.loadCurrentSong();
                app.render();
                audio.play();
            }
        };
        
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
        audio.src = this.currentSong.path;
    },

    nextSong: function() {
        this.currentIndex++;
        if(this.currentIndex >= this.song.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
        this.scrollToActiveSong();
    },

    prevSong: function() {
        this.currentIndex--;
        if(this.currentIndex < 0) {
            this.currentIndex = this.song.length -1 ;
        }
        this.loadCurrentSong();
        this.scrollToActiveSong();
    },
    //Xử lý Randombai2 hát và tránh lặp lại bài hát trước đó khi random bài hát
    playRandomSong: function() {
        let randomNumber;
        randomNumber = Math.floor(Math.random() * this.song.length );
        const check = this.arrNum.some(value => {
            return value === randomNumber;
        })
        if(check === false) {
            app.currentIndex = randomNumber;
            app.loadCurrentSong();
            app.arrNum.push(randomNumber);
        }else {
            if(app.arrNum.length === app.song.length) {  
                app.arrNum = [randomNumber];
                app.currentIndex = randomNumber;
                app.loadCurrentSong();
            }else {            
                app.playRandomSong();  
            }
        }
    },
    // Xử lý lặp lại bài hát trước đó khi random bài hát
    // saveRandom: function(randomNumber) {
    //     let check= false;
    //     if(app.arrNum.length === app.song.length) {
    //         app.currentIndex = randomNumber;
    //         app.loadCurrentSong();
    //         app.arrNum = [];
    //     }else{
    //         for(let i = 0; i < app.arrNum.length; i++) {
    //             if(app.arrNum[i] === randomNumber) {
    //                 check = true;   
    //                 break;
    //             }else {
    //                 check = false;
    //             }
    //         }
    //         if(check === false) {
    //             app.currentIndex = randomNumber;
    //             app.loadCurrentSong();
    //             app.arrNum.push(randomNumber);
    //         }else {
    //             app.playRandomSong();
    //         }
    //     }
    // }, 

    //Tự động scroll khi nhấn next hoạc prev 
    scrollToActiveSong: function() {
        setTimeout(() => {
            $(".song.active").scrollIntoView({
                behavior: "smooth",
                block: "end"
            });  //scrollIntoView là phương thức element
        },200);
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
        if(this.config.indexSong) {
            this.currentIndex = this.config.indexSong;
        }
        if(this.isRandom) {
            btnRandom.classList.toggle("active", app.isRandom);
        }
        if(this.isRepeat){
            btnRepeat.classList.toggle("active", app.isRepeat);
        }
    },

    start: function() {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig();
        this.render();
        // Định nghĩa thuộc tính cho Object
        this.defienProperties();

        this.loadCurrentSong();

        this.handleEvants();
    }
};

app.start();
