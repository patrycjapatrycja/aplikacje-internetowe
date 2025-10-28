class Location {
    constructor() {
        this.latitude = 0;
        this.longitude = 0;
        this.map = null;
        this.zoom = 18;
        this.rasterMap = null;
        this.dimensions = null;
        this.puzzleCount = 16; // musi mieć naturalny pierwiastek
        this.puzzles = [];
        this.correctPuzzles = 0;
    }

    getLocation() {
        if (!navigator.geolocation) {
            alert("No geolocation");
        }

        navigator.geolocation.getCurrentPosition((position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            this.latitude = latitude;
            this.longitude = longitude;

            if (this.map == null) {
                this.map = L.map('map').setView([latitude, longitude], this.zoom);
            } else {
                this.map.setView([latitude, longitude], this.zoom);
            }
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(this.map);

        }, (error) => {
            console.log(error);
        }, {
            enableHighAccuracy: false
        });
    };

    saveRasterMap() {
        if (this.map == null) {
            return
        }
        let canvas = document.getElementById('image-canvas');
        let context = canvas.getContext("2d");

        const dimensions = this.map.getSize();
        this.dimensions = dimensions;
        this.correctPuzzles = 0;

        leafletImage(this.map, (err, imageCanvas) => {
            canvas.width = dimensions.x;
            canvas.height = dimensions.y;
            context.clearRect(0,0, canvas.width, canvas.height);
            context.drawImage(imageCanvas, 0, 0, canvas.width, canvas.height);
            this.rasterMap = canvas;
            this.cutImageIntoPuzzles(this.rasterMap);
            this.showPuzzles();
        });
        this.createPuzzlesDestinationGrid('puzzle-pieces-end', true);
        this.createPuzzlesDestinationGrid('puzzle-pieces-start', false);
    };

    createPuzzlesDestinationGrid(elementId, finalDestination) {
        const puzzleBox = document.getElementById(elementId);
        puzzleBox.innerHTML = "";

        const divider = Math.sqrt(this.puzzleCount);
        puzzleBox.style.gridTemplateColumns = `repeat(${divider}, 1fr)`;
        puzzleBox.style.gridTemplateRows = `repeat(${divider}, 1fr)`;

        const idLettersToCut = "puzzle-".length;
        const puzzlePlaceIdToCut = "puzzle-div-container-".length;

        for (let i =0; i< this.puzzleCount; i++) {
            const puzzlePlace = document.createElement('div');
            puzzlePlace.classList.add('puzzle-div-container');
            puzzlePlace.id = `puzzle-div-container-${i}`;
            puzzlePlace.style.width = `${this.dimensions.x / divider}`;
            puzzlePlace.style.height = `${this.dimensions.y / divider}`;

            puzzlePlace.addEventListener('dragenter', function (e) {
                this.style.backgroundColor = "#d9e4ef";
            });

            puzzlePlace.addEventListener('dragleave', function (e) {
                this.style.backgroundColor = "white";
            });

            puzzlePlace.addEventListener('dragover', function (e) {
               e.preventDefault();
            });

            puzzlePlace.addEventListener('drop',  (e) => {
                if (puzzlePlace.children.length > 0) {
                    return
                }
                let puzzle = document.querySelector("#" + e.dataTransfer.getData('text'));
                puzzlePlace.style.backgroundColor = "white";

                puzzlePlace.appendChild(puzzle);

                if (finalDestination) {
                    const puzzleId = puzzle.id.slice(idLettersToCut);
                    const placeId = puzzlePlace.id.slice(puzzlePlaceIdToCut);
                    if (puzzleId === placeId) {
                        puzzle.draggable = false;
                        this.correctPuzzles++;

                        if (this.correctPuzzles >= this.puzzleCount) {
                            setTimeout(() => {
                                console.log("puzzle ułożone!");
                                this.notify();
                            }, 100);
                        }
                    }
                }
            }, false);

            puzzleBox.appendChild(puzzlePlace);
        }
    };

    cutImageIntoPuzzles(canvas) {
        const divider = Math.sqrt(this.puzzleCount);
        const puzzleWidth = canvas.width / divider;
        const puzzleHeight = canvas.height / divider;
        this.puzzles = [];

        const puzzleBox = document.getElementById('puzzle-pieces-start');
        puzzleBox.style.gridTemplateColumns = `repeat(${divider}, 1fr)`;
        puzzleBox.style.gridTemplateRows = `repeat(${divider}, 1fr)`;

        let i = 0;
        for (let row = 0; row < divider; row++) {
            for (let col = 0; col < divider; col++) {
                const puzzleCanvas = document.createElement('canvas');
                const puzzleContext = puzzleCanvas.getContext('2d');
                puzzleCanvas.width = puzzleWidth;
                puzzleCanvas.height = puzzleHeight;

                puzzleContext.drawImage(canvas, col * puzzleWidth, row * puzzleHeight, puzzleWidth, puzzleHeight, 0, 0, puzzleWidth, puzzleHeight);

                const puzzlePiece = document.createElement('div');
                puzzlePiece.id = `puzzle-${i}`;

                puzzlePiece.draggable = true;
                puzzlePiece.addEventListener("dragstart", (e) => {
                    e.dataTransfer.setData("text", puzzlePiece.id);
                });

                puzzlePiece.appendChild(puzzleCanvas);
                this.puzzles.push(puzzlePiece);

                i++;
            }
        }
    };

    showPuzzles() {
        const puzzleBoxMain = document.getElementById('puzzle-pieces-start');
        const puzzleBoxes = puzzleBoxMain.children;

        const arr = Array.from({length: this.puzzles.length}, (e, i)=> i);

        for (let i = 0; i < this.puzzleCount; i++) {
            const randomIndex = Math.floor(Math.random() * arr.length);
            const idx = arr[randomIndex];
            puzzleBoxes[i].appendChild(this.puzzles[idx]);
            arr.splice(randomIndex, 1);
        }
    };

    notify() {
        if (!("Notification" in window)) {
            alert("No notification");
        } else if (Notification.permission === "granted") {
            const notification = new Notification("Udało Ci się ułożyć puzzle!");
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    const notification = new Notification("Udało Ci się ułożyć puzzle!");
                }
            })
        }
    }


}

addEventListener('load', (e) => {
    const getLocationButton = document.getElementById("get-location-button");
    const saveImageButton = document.getElementById('save-button');

    const locClass = new Location();

    getLocationButton.addEventListener('click', () => {
        locClass.getLocation();
    });

    saveImageButton.addEventListener('click', () => {
        locClass.saveRasterMap();
    });
});