// ==UserScript==
// @name         ХомякВеб
// @namespace    https://hamsterkombat.io/*
// @version      1.1
// @description  Ну что тут написать, запускает хомяка в WEB
// @author       VladimirSauko
// @match        https://*.hamsterkombat.io/*
// @match        https://web.telegram.org/*/*
// @icon         https://hamsterkombat.io/images/icons/hamster-coin.png
// @downloadURL  https://github.com/GravelFire/HamsterKombatWebJS/raw/master/hamsterkombat_web.js
// @updateURL    https://github.com/GravelFire/HamsterKombatWebJS/raw/master/hamsterkombat_web.js
// @homepage     https://github.com/GravelFire/HamsterKombatWebJS
// ==/UserScript==
//
(function() {
    'use strict';

const customConsole = {log: function() {}};

const currentUrl = window.location.href;

// Константы
const pauseDelay = 2000; // Задержка между буквами (ms)
const dotDelay = 1; // Длительность точки (ms)
const dashDelay = 750; // Длительность тире (ms)
const extraDelay = 200; // Дополнительная пауза между нажатиями (ms)
const multiplyTap = 16; // Сколько энергии тратится за 1 тап


unsafeWindow.console = customConsole;
window.console = customConsole;

if (unsafeWindow && unsafeWindow.Telegram && unsafeWindow.Telegram.WebApp)
    unsafeWindow.Telegram.WebApp = new Proxy(unsafeWindow.Telegram.WebApp, {
        get(target, prop) {
            if (prop === 'platform')
                return 'android';
            if (typeof target[prop] === 'function')
                return function(...args) {
                    if (prop === 'exampleMethod') args[0] = 'modified argument';
                    return target[prop].apply(this, args);
                };
            return target[prop];
        }
    });

function findTapButton() {
    return document.querySelector('.user-tap-button');
}

function energyLevel() {
    const energyElement = document.querySelector(".user-tap-energy p");
    if (energyElement) {
        return parseInt(energyElement.textContent.split(" / ")[0], 10);
    }
    return 0;
}

async function simulateTap(button, delay) {
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + (rect.width / 2);
    const centerY = rect.top + (rect.height / 2);

    const downEvent = new PointerEvent('pointerdown', {
        bubbles: true,
        clientX: centerX,
        clientY: centerY
    });

    const upEvent = new PointerEvent('pointerup', {
        bubbles: true,
        clientX: centerX,
        clientY: centerY
    });

    button.dispatchEvent(downEvent);
    await new Promise(resolve => setTimeout(resolve, delay));
    button.dispatchEvent(upEvent);
    await new Promise(resolve => setTimeout(resolve, delay));
}

async function dotTap(button) {
    if (energyLevel() > 100) {
        await simulateTap(button, dotDelay);
    }
}

async function dashTap(button) {
    if (energyLevel() > 100) {
        await simulateTap(button, dashDelay);
    }
}

function pauseBetweenLetters() {
    return new Promise(resolve => setTimeout(resolve, pauseDelay));
}

function textToMorse(text) {
    const morseCodeMap = {
        'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....',
        'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.',
        'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
        'Y': '-.--', 'Z': '--..', ' ': ' '
    };

    return text.toUpperCase().split('').map(char => {
        if (char in morseCodeMap) {
            return morseCodeMap[char];
        } else if (char === ' ') {
            return ' ';
        }
        return '';
    }).join(' ');
}

async function textToTap(morseString) {
    const button = findTapButton();
    if (!button) {
        console.log('Button not found');
        return;
    }

    let clickWord = 0;
    let clickTime = 0;

    for (const char of morseString) {
        switch (char) {
            case '.':
                await dotTap(button);
                clickWord++;
                clickTime += dotDelay;
                break;
            case '-':
                await dashTap(button);
                clickWord++;
                clickTime += dashDelay;
                break;
            case ' ':
                await pauseBetweenLetters();
                break;
        }

        const energyNow = energyLevel();
        const waitTime = actionCanProceed(energyNow, clickWord, clickTime, multiplyTap);
        if (waitTime > 0) {
            console.log(`Not enough energy, waiting for ${waitTime} seconds...`);
            await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
        }
    }

    await pauseBetweenLetters();
}

function actionCanProceed(energyNow, clickWord, clickTime, multiplyTap) {
    let energyCost = Math.ceil((clickWord * multiplyTap) - ((clickTime / 1000) * 3));
    let waitUntilEnergy = 0;

    if (energyCost > energyNow)
        waitUntilEnergy = Math.ceil((energyCost - energyNow) / 3 + 3);

    return waitUntilEnergy;
}
function addInputField() {
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.id = 'morseInputField';
    inputField.placeholder = 'Вводи шифр';
    inputField.style.position = 'fixed';
    inputField.style.top = '10px';
    inputField.style.right = '10px';
    inputField.style.width = '110px'
    inputField.style.zIndex = '9999';
    inputField.style.padding = '5px';
    inputField.style.backgroundColor = 'WHITE';
    inputField.style.border = 'black';
    inputField.style.borderRadius = '10px';
    inputField.style.fontSize = '16px';

    const button = document.createElement('button');
    button.textContent = 'vsauko';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.zIndex = '9999';
    button.style.padding = '4px 8px';
    button.style.backgroundColor = '#5d5abd';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '10px';
    button.style.cursor = 'pointer';
    document.body.appendChild(button);

    document.body.appendChild(inputField);

    inputField.addEventListener('keydown', async function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const text = inputField.value;
            const morseString = textToMorse(text);
            console.log('Введён шифр ', morseString);
            await textToTap(morseString);
            inputField.value = '';
        }
    });
}

function hamsterkombatFunctionality() {
    window.addEventListener('load', () => {
        addInputField();
    });
}

if (currentUrl.includes('hamsterkombat.io')) {
    hamsterkombatFunctionality();
}
})();
