// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        console.log('Canvas initialized:', canvas.width, 'x', canvas.height, ctx ? '' : '(no 2d context)');
    }

    const bg1 = document.getElementById('bg1');
    const bg2 = document.getElementById('bg2');

    if (bg1 && bg2) {
        let showFirst = true;
        const transitionDurationMs = 6000;
        let bgOffsetX = 0;
        let bgCurrentSpeed = -0.08;
        let lastFrameTime = performance.now();
        let driftRightUntil = 0;
        let bgCurrentScale = 1.06;
        let bgCurrentRotation = 90;

        const leftDriftSpeed = -0.08;
        const rightDriftSpeed = 0.22;
        const maxOffset = 2.4;
        const smoothing = 0.025;
        const baseScale = 1.06;
        const baseRotation = 90;

        const getActiveHotspotCount = () => {
            return document.querySelectorAll('.hotspot.is-active').length;
        };

        const updateBackgroundTransform = (time) => {
            const activeCount = getActiveHotspotCount();
            const targetScale = baseScale + Math.min(0.08, activeCount * 0.014);
            const targetRotation = baseRotation + Math.sin(time * 0.00035) * 0.8 + activeCount * 0.9;

            bgCurrentScale += (targetScale - bgCurrentScale) * 0.03;
            bgCurrentRotation += (targetRotation - bgCurrentRotation) * 0.03;

            const transformValue = `translate(-50%, -50%) translateX(${bgOffsetX}vw) scale(${bgCurrentScale}) rotate(${bgCurrentRotation}deg)`;
            bg1.style.transform = transformValue;
            bg2.style.transform = transformValue;
        };

        const animateBackgroundDrift = (time) => {
            const deltaSeconds = Math.min(0.05, (time - lastFrameTime) / 1000);
            lastFrameTime = time;

            const targetSpeed = time < driftRightUntil ? rightDriftSpeed : leftDriftSpeed;
            bgCurrentSpeed += (targetSpeed - bgCurrentSpeed) * smoothing;
            bgOffsetX += bgCurrentSpeed * deltaSeconds;
            bgOffsetX = Math.max(-maxOffset, Math.min(maxOffset, bgOffsetX));

            updateBackgroundTransform(time);
            requestAnimationFrame(animateBackgroundDrift);
        };

        const triggerRightDrift = (event) => {
            if (!(event.target instanceof Element)) {
                return;
            }

            if (event.target.closest('.hotspot')) {
                return;
            }

            driftRightUntil = performance.now() + 2400;
        };

        document.addEventListener('pointermove', triggerRightDrift, { passive: true });
        document.addEventListener('touchmove', triggerRightDrift, { passive: true });

        updateBackgroundTransform(performance.now());
        requestAnimationFrame(animateBackgroundDrift);

        setInterval(() => {
            showFirst = !showFirst;
            bg1.style.opacity = showFirst ? '1' : '0';
            bg2.style.opacity = showFirst ? '0' : '1';
        }, transitionDurationMs);
    }

    const listenButton = document.getElementById('listen-btn');
    const hotspots = Array.from(document.querySelectorAll('.hotspot'));
    const audioById = new Map();
    const pinned = new Set();
    const fadeTimers = new Map();
    let listeningEnabled = false;
    let audioPrimed = false;

    document.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase();

        if (key === 'd') {
            document.body.classList.toggle('debug-hotspots');
            return;
        }

        if (key === 's') {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            const hotspotData = hotspots.map((hotspot) => {
                const rect = hotspot.getBoundingClientRect();
                return {
                    area: Array.from(hotspot.classList).find((className) => className.startsWith('area-')) || 'unknown',
                    left: `${((rect.left / viewportWidth) * 100).toFixed(2)}%`,
                    top: `${((rect.top / viewportHeight) * 100).toFixed(2)}%`,
                    width: `${((rect.width / viewportWidth) * 100).toFixed(2)}%`,
                    height: `${((rect.height / viewportHeight) * 100).toFixed(2)}%`
                };
            });

            console.table(hotspotData);

            const cssSnippets = hotspotData
                .filter((item) => item.area !== 'unknown')
                .map((item) => {
                    return `${item.area} {\n  left: ${item.left};\n  top: ${item.top};\n  width: ${item.width};\n  height: ${item.height};\n}`;
                })
                .join('\n\n');

            if (!cssSnippets) {
                return;
            }

            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard
                    .writeText(cssSnippets)
                    .then(() => console.log('Hotspot CSS copied to clipboard.'))
                    .catch(() => console.log('Could not copy CSS automatically. See snippets below:\n\n' + cssSnippets));
            } else {
                console.log('Clipboard unavailable. Copy these hotspot CSS snippets:\n\n' + cssSnippets);
            }
        }
    });

    function fadeTo(audio, targetVolume, durationMs) {
        if (fadeTimers.has(audio)) {
            clearInterval(fadeTimers.get(audio));
        }

        const fps = 30;
        const intervalMs = 1000 / fps;
        const steps = Math.max(1, Math.round(durationMs / intervalMs));
        const startVolume = audio.volume;
        let step = 0;

        const timer = setInterval(() => {
            step += 1;
            const progress = Math.min(1, step / steps);
            audio.volume = startVolume + (targetVolume - startVolume) * progress;

            if (progress >= 1) {
                clearInterval(timer);
                fadeTimers.delete(audio);
                if (targetVolume <= 0 && !pinned.has(audio.id)) {
                    audio.pause();
                }
            }
        }, intervalMs);

        fadeTimers.set(audio, timer);
    }

    function ensurePlaying(audio) {
        if (audio.paused) {
            audio.play().catch(() => { });
        }
    }

    function activateArea(audio) {
        if (!listeningEnabled || !audio) {
            return;
        }

        ensurePlaying(audio);
        fadeTo(audio, 1, 500);
    }

    function deactivateArea(audio) {
        if (!audio || pinned.has(audio.id)) {
            return;
        }

        fadeTo(audio, 0, 900);
    }

    function setButtonState() {
        if (!listenButton) {
            return;
        }

        listenButton.textContent = listeningEnabled ? 'Silent' : 'Listen';
        listenButton.setAttribute('aria-label', listeningEnabled ? 'Turn sound off' : 'Enable sound');
    }

    function silenceAllAudio() {
        pinned.clear();
        hotspots.forEach((hotspot) => hotspot.classList.remove('is-active'));

        audioById.forEach((audio) => {
            fadeTo(audio, 0, 250);
            setTimeout(() => {
                if (!listeningEnabled) {
                    audio.pause();
                }
            }, 280);
        });
    }

    document.querySelectorAll('.map-audio').forEach((audio) => {
        audio.volume = 0;
        audioById.set(audio.id, audio);
    });

    hotspots.forEach((hotspot) => {
        const soundId = hotspot.dataset.sound;
        const audio = soundId ? audioById.get(soundId) : null;
        if (!audio) {
            return;
        }

        hotspot.addEventListener('pointerenter', () => {
            hotspot.classList.add('is-active');
            activateArea(audio);
        });
        hotspot.addEventListener('pointerleave', () => {
            if (!pinned.has(audio.id)) {
                hotspot.classList.remove('is-active');
            }
            deactivateArea(audio);
        });

        hotspot.addEventListener('click', (event) => {
            event.preventDefault();
            if (!listeningEnabled) {
                return;
            }

            if (pinned.has(audio.id)) {
                pinned.delete(audio.id);
                hotspot.classList.remove('is-active');
                deactivateArea(audio);
            } else {
                pinned.add(audio.id);
                hotspot.classList.add('is-active');
                activateArea(audio);
            }
        });
    });

    if (listenButton) {
        listenButton.addEventListener('click', async () => {
            const audioElements = Array.from(audioById.values());

            if (!listeningEnabled) {
                if (!audioPrimed) {
                    await Promise.allSettled(audioElements.map((audio) => audio.play()));
                    audioElements.forEach((audio) => {
                        audio.pause();
                        audio.currentTime = 0;
                        audio.volume = 0;
                    });
                    audioPrimed = true;
                }

                listeningEnabled = true;
            } else {
                listeningEnabled = false;
                silenceAllAudio();
            }

            setButtonState();
        });
    }

    setButtonState();

    console.log('Background images:', !!bg1, !!bg2);
    console.log('Press "D" to toggle hotspot debug mode.');
    console.log('Press "S" to print hotspot positions/sizes.');
});
