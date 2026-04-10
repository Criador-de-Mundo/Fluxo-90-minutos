let studySec = 90 * 60;   // 90 minutos
let breakSec = 20 * 60;   // 20 minutos
let current = studySec;
let isStudy = true;
let running = false;
let target = null;
let intervalId = null;

const timerDiv = document.getElementById('timer');
const phaseDiv = document.getElementById('phase');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const requestNotifyBtn = document.getElementById('requestNotifyBtn');

function format(sec) {
    let h = Math.floor(sec / 3600);
    let m = Math.floor((sec % 3600) / 60);
    let s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function updateDisplay() {
    timerDiv.innerText = format(current);
}

function playBeep() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.value = 0.3;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1);
        osc.stop(ctx.currentTime + 1);
    } catch (e) { console.log("Áudio não suportado"); }
    if (navigator.vibrate) navigator.vibrate(200);
}

function sendNotification(title, body) {
    if (Notification.permission === 'granted') {
        new Notification(title, { body });
    } else {
        alert(`🔔 ${title}: ${body}`);
    }
}

function switchPhase() {
    if (isStudy) {
        current = breakSec;
        isStudy = false;
        phaseDiv.innerText = "🌿 Pausa ativa (20 min)";
        sendNotification('📘 Fluxo 90min', 'Estudo concluído! Descanse 20 minutos.');
    } else {
        current = studySec;
        isStudy = true;
        phaseDiv.innerText = "📘 Estudo profundo (90 min)";
        sendNotification('🌿 Fluxo 90min', 'Pausa encerrada! Volte aos estudos por 90 minutos.');
    }
    updateDisplay();
    playBeep();
}

function tick() {
    if (!running) return;
    const now = Date.now();
    if (target && now >= target) {
        running = false;
        if (intervalId) clearInterval(intervalId);
        switchPhase();
        startTimer();
        return;
    }
    if (target) {
        let rem = Math.max(0, Math.floor((target - now) / 1000));
        if (rem !== current) {
            current = rem;
            updateDisplay();
            if (current <= 0) {
                running = false;
                clearInterval(intervalId);
                switchPhase();
                startTimer();
            }
        }
    }
}

function startTimer() {
    if (running) return;
    running = true;
    target = Date.now() + current * 1000;
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(tick, 200);
}

function pauseTimer() {
    if (!running) return;
    running = false;
    if (intervalId) clearInterval(intervalId);
    if (target) {
        current = Math.max(0, Math.floor((target - Date.now()) / 1000));
        updateDisplay();
        target = null;
    }
}

function resetTimer() {
    running = false;
    if (intervalId) clearInterval(intervalId);
    target = null;
    isStudy = true;
    current = studySec;
    phaseDiv.innerText = "📘 Estudo profundo (90 min)";
    updateDisplay();
}

function requestNotificationPermission() {
    if (Notification.permission === 'default') {
        Notification.requestPermission().then(perm => {
            if (perm === 'granted') alert('✅ Notificações ativadas!');
            else alert('❌ Permissão negada');
        });
    } else if (Notification.permission === 'granted') {
        alert('✅ Notificações já estão ativadas');
    } else {
        alert('❌ Permissão negada permanentemente. Ative nas configurações.');
    }
}

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
requestNotifyBtn.addEventListener('click', requestNotificationPermission);

updateDisplay();
if (Notification.permission === 'default') Notification.requestPermission();
