// ==UserScript==
// @name         ХомякВеб
// @namespace    https://hamsterkombat.io/*
// @version      1.0
// @description  Ну что тут написать, запускает хомяка в WEB
// @author       VladimirSauko
// @include      *://hamsterkombat.io/*
// @icon         https://hamsterkombat.io/images/icons/hamster-coin.png
// @downloadURL  https://github.com/GravelFire/HamsterKombatWebJS/raw/master/hamsterkombat_web.user.js
// @updateURL    https://github.com/GravelFire/HamsterKombatWebJS/raw/master/hamsterkombat_web.user.js
// @homepage     https://github.com/GravelFire/HamsterKombatWebJS
// ==/UserScript==
//
(function() {
    'use strict';

const customConsole = {log: function() {}};
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
})();
