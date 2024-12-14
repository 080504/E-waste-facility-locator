document.getElementById('start-scanner').addEventListener('click', () => {
    const video = document.createElement('video');
    video.setAttribute('id', 'scanner');
    document.body.appendChild(video);

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then((stream) => {
                video.srcObject = stream;
                video.play();

                // Initialize Quagga.js
                Quagga.init({
                    inputStream: {
                        name: "Live",
                        type: "LiveStream",
                        target: video, // Attach Quagga to the video element
                        constraints: {
                            width: 640,
                            height: 480,
                            facingMode: "environment" // Rear-facing camera
                        }
                    },
                    decoder: {
                        readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader", "upc_reader", "upc_e_reader"],
                        debug: {
                            drawBoundingBox: true,
                            showFrequency: true,
                            drawScanline: true,
                            showPattern: true
                        }
                    },
                    locate: true, // Enable barcode localization
                    numOfWorkers: navigator.hardwareConcurrency || 4 // Optimize worker threads
                }, (err) => {
                    if (err) {
                        console.error("Quagga initialization failed:", err);
                        alert("Failed to initialize barcode scanner.");
                        return;
                    }
                    console.log("Quagga scanner initialized.");
                    Quagga.start();
                });

                // Handle barcode detection
                Quagga.onDetected((data) => {
                    console.log("Barcode detected:", data.codeResult.code);
                    alert(`Barcode Detected: ${data.codeResult.code}`);
                    Quagga.stop(); // Stop scanner after detection
                    video.srcObject.getTracks().forEach(track => track.stop()); // Stop the camera
                    video.remove(); // Remove video element
                });
            })
            .catch((err) => {
                console.error("Error accessing camera:", err);
                alert("Camera access denied or unavailable.");
            });
    } else {
        alert("Camera not supported in this browser.");
    }
});

document.getElementById('stop-scanner').addEventListener('click', () => {
    const video = document.getElementById('scanner');
    if (video) {
        video.srcObject.getTracks().forEach(track => track.stop()); // Stop all tracks
        Quagga.stop();
        video.remove();
        console.log("Scanner stopped.");
    }
});
