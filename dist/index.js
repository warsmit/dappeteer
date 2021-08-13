"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetamask = exports.launch = void 0;
const path = require("path");
const timeout = (seconds) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));
function launch(puppeteer, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const { args, headless } = options, rest = __rest(options, ["args", "headless"]);
        const { metamaskVersion, metamaskPath } = options;
        const METAMASK_VERSION = metamaskVersion || "10.0.1";
        // console["log"](path.join(__dirname, `metamask/${METAMASK_VERSION}`));
        const METAMASK_PATH = metamaskPath || path.resolve(__dirname, "..", "metamask", METAMASK_VERSION);
        return puppeteer.launch(Object.assign({ headless: headless || false, args: [
                `--disable-extensions-except=${METAMASK_PATH}`,
                `--load-extension=${METAMASK_PATH}`,
                ...(args || []),
            ] }, rest));
    });
}
exports.launch = launch;
function getMetamask(browser, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const metamaskPage = yield closeHomeScreen(browser);
        // const metamaskPage = await getMetamaskPage(browser, options.extensionId, options.extensionUrl)
        yield confirmWelcomeScreen(metamaskPage);
        yield importAccount(metamaskPage, options.seed ||
            "already turtle birth enroll since owner keep patch skirt drift any dinner", options.password || "password1234");
        let signedIn = true;
        closeNotificationPage(browser);
        return {
            lock: () => __awaiter(this, void 0, void 0, function* () {
                if (!signedIn) {
                    throw new Error("You can't sign out because you haven't signed in yet");
                }
                yield metamaskPage.bringToFront();
                const accountSwitcher = yield metamaskPage.waitForSelector(".identicon");
                yield accountSwitcher.click();
                const signoutButton = yield metamaskPage.waitForSelector(".account-menu__lock-button");
                yield signoutButton.click();
                yield waitForSignInScreen(metamaskPage);
                signedIn = false;
            }),
            unlock: (password = "password1234") => __awaiter(this, void 0, void 0, function* () {
                if (signedIn) {
                    throw new Error("You can't sign in because you are already signed in");
                }
                yield metamaskPage.bringToFront();
                const passwordBox = yield metamaskPage.waitForSelector("#password");
                yield passwordBox.type(password);
                const login = yield metamaskPage.waitForSelector(".unlock-page button");
                yield login.click();
                yield waitForUnlockedScreen(metamaskPage);
                signedIn = true;
            }),
            addNetwork: ({ url, chainId }) => __awaiter(this, void 0, void 0, function* () {
                yield metamaskPage.bringToFront();
                const networkSwitcher = yield metamaskPage.waitForSelector(".network-indicator");
                yield networkSwitcher.click();
                yield metamaskPage.waitForSelector("li.dropdown-menu-item");
                const networkIndex = yield metamaskPage.evaluate((network) => {
                    const elements = document.querySelectorAll("li.dropdown-menu-item");
                    for (let i = 0; i < elements.length; i++) {
                        const element = elements[i];
                        if (element.innerText
                            .toLowerCase()
                            .includes(network.toLowerCase())) {
                            return i;
                        }
                    }
                    return elements.length - 1;
                }, "Custom RPC");
                const networkButton = (yield metamaskPage.$$("li.dropdown-menu-item"))[networkIndex];
                yield networkButton.click();
                const newRPCInput = yield metamaskPage.waitForSelector("input#rpc-url");
                yield newRPCInput.type(url);
                const chainIdInput = yield metamaskPage.waitForSelector("input#chainId");
                yield chainIdInput.type(chainId);
                const saveButton = yield metamaskPage.waitForSelector(".network-form__footer .btn-secondary");
                yield saveButton.click();
                const prevButton = yield metamaskPage.waitForSelector("img.app-header__metafox-logo");
                yield prevButton.click();
                yield waitForUnlockedScreen(metamaskPage);
            }),
            importPK: (pk) => __awaiter(this, void 0, void 0, function* () {
                yield metamaskPage.bringToFront();
                const accountSwitcher = yield metamaskPage.waitForSelector(".identicon");
                yield accountSwitcher.click();
                const addAccount = yield metamaskPage.waitForSelector(".account-menu > div:nth-child(7)");
                yield addAccount.click();
                const PKInput = yield metamaskPage.waitForSelector("input#private-key-box");
                yield PKInput.type(pk);
                const importButton = yield metamaskPage.waitForSelector("button.btn-secondary");
                yield importButton.click();
                yield waitForUnlockedScreen(metamaskPage);
            }),
            switchAccount: (accountNumber) => __awaiter(this, void 0, void 0, function* () {
                yield metamaskPage.bringToFront();
                const accountSwitcher = yield metamaskPage.waitForSelector(".identicon");
                yield accountSwitcher.click();
                const account = yield metamaskPage.waitForSelector(`.account-menu__accounts > div:nth-child(${accountNumber})`);
                yield account.click();
                yield waitForUnlockedScreen(metamaskPage);
            }),
            switchNetwork: (network = "main") => __awaiter(this, void 0, void 0, function* () {
                yield metamaskPage.bringToFront();
                const networkSwitcher = yield metamaskPage.waitForSelector("div.network-display.chip.chip--with-left-icon.chip--with-right-icon.chip--ui-3");
                yield networkSwitcher.click();
                yield metamaskPage.waitForSelector("li.dropdown-menu-item");
                const networkIndex = yield metamaskPage.evaluate((network) => {
                    const elements = document.querySelectorAll("li.dropdown-menu-item");
                    for (let i = 0; i < elements.length; i++) {
                        const element = elements[i];
                        if (element.innerText
                            .toLowerCase()
                            .includes(network.toLowerCase())) {
                            return i;
                        }
                    }
                    return 0;
                }, network);
                const networkButton = (yield metamaskPage.$$("li.dropdown-menu-item"))[networkIndex];
                yield networkButton.click();
                yield waitForEthereum(metamaskPage);
            }),
            confirmTransaction: (options) => __awaiter(this, void 0, void 0, function* () {
                yield metamaskPage.bringToFront();
                if (!signedIn) {
                    throw new Error("You haven't signed in yet");
                }
                yield metamaskPage.reload();
                if (options === null || options === void 0 ? void 0 : options.gas) {
                    const gasSelector = ".advanced-gas-inputs__gas-edit-row:nth-child(1) input";
                    const gas = yield metamaskPage.waitForSelector(gasSelector);
                    yield metamaskPage.evaluate(() => (document.querySelectorAll(".advanced-gas-inputs__gas-edit-row:nth-child(1) input")[0].value = ""));
                    yield gas.type(options.gas.toString());
                }
                if (options === null || options === void 0 ? void 0 : options.gasLimit) {
                    const gasLimitSelector = ".advanced-gas-inputs__gas-edit-row:nth-child(2) input";
                    const gasLimit = yield metamaskPage.waitForSelector(gasLimitSelector);
                    yield metamaskPage.evaluate(() => (document.querySelectorAll(".advanced-gas-inputs__gas-edit-row:nth-child(2) input")[0].value = ""));
                    yield gasLimit.type(options.gasLimit.toString());
                }
                const confirmButtonSelector = "#app-content .btn-primary.page-container__footer-button";
                const confirmButton = yield metamaskPage.waitForSelector(confirmButtonSelector);
                yield confirmButton.click();
                yield waitForUnlockedScreen(metamaskPage);
            }),
            sign: () => __awaiter(this, void 0, void 0, function* () {
                yield metamaskPage.bringToFront();
                if (!signedIn) {
                    throw new Error("You haven't signed in yet");
                }
                yield metamaskPage.reload();
                const confirmButtonSelector = "button.button.btn-secondary.btn--large.request-signature__footer__sign-button";
                const button = yield metamaskPage.waitForSelector(confirmButtonSelector);
                yield button.click();
                yield waitForUnlockedScreen(metamaskPage);
            }),
            approve: ({ allAccounts = false }) => __awaiter(this, void 0, void 0, function* () {
                yield metamaskPage.bringToFront();
                if (!signedIn) {
                    throw new Error("You haven't signed in yet");
                }
                yield metamaskPage.reload();
                // If we want to approve all imported accounts to be used with our Dapp and avoid
                // difficulties connecting while switching accounts
                if (allAccounts) {
                    const accountListElementsSelector = ".permissions-connect-choose-account__account";
                    // We wait until the list is loaded and we check that it has more than 1 element
                    yield metamaskPage.waitForSelector(accountListElementsSelector);
                    const accountListElements = yield metamaskPage.$$(accountListElementsSelector);
                    // Try to click input only if there is more than one account. It won't be present with one
                    // account or less
                    if (accountListElements.length > 1) {
                        const selectAllCheckboxSelector = ".permissions-connect-choose-account__select-all input";
                        const allAccountsCheckbox = yield metamaskPage.waitForSelector(selectAllCheckboxSelector);
                        yield allAccountsCheckbox.click();
                    }
                }
                const confirmButtonSelector = ".permissions-connect-choose-account__bottom-buttons button.button.btn-primary";
                const button = yield metamaskPage.waitForSelector(confirmButtonSelector);
                yield button.click();
                const permissionApprovalSelector = ".permission-approval-container__footers button.button.btn-primary";
                const permissionApprovalButton = yield metamaskPage.waitForSelector(permissionApprovalSelector);
                yield permissionApprovalButton.click();
                yield waitForUnlockedScreen(metamaskPage);
            }),
            closeNewsPopup: () => __awaiter(this, void 0, void 0, function* () {
                yield metamaskPage.bringToFront();
                yield metamaskPage.reload();
                const closePopupSelector = 'section.popover-wrap.whats-new-popup__popover button.fas.fa-times.popover-header__button'
                
                try {
                    var buttonClosePopup = yield metamaskPage.waitForSelector(closePopupSelector, {timeout: 1000});
                    do {
                        yield buttonClosePopup.click();
                        yield metamaskPage.reload();
                        buttonClosePopup = yield metamaskPage.waitForSelector(closePopupSelector, {timeout: 1000});
                    } while (buttonClosePopup);
                } catch (error) { }

                yield waitForUnlockedScreen(metamaskPage);
            }),
        };
    });
}
exports.getMetamask = getMetamask;
function closeHomeScreen(browser) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            browser.on("targetcreated", (target) => __awaiter(this, void 0, void 0, function* () {
                if (target.url().match("chrome-extension://[a-z]+/home.html")) {
                    try {
                        const page = yield target.page();
                        resolve(page);
                    }
                    catch (e) {
                        reject(e);
                    }
                }
            }));
        });
    });
}
function closeNotificationPage(browser) {
    return __awaiter(this, void 0, void 0, function* () {
        browser.on("targetcreated", (target) => __awaiter(this, void 0, void 0, function* () {
            if (target.url() ===
                "chrome-extension://plkiloelkgnphnmaonlbbjbiphdalblo/notification.html") {
                try {
                    const page = yield target.page();
                    yield page.close();
                }
                catch (_a) { }
            }
        }));
    });
}
function getMetamaskPage(browser, extensionId, extensionUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const EXTENSION_ID = extensionId || "nkbihfbeogaeaoehlefnkodbefgpgknn";
        const EXTENSION_URL = extensionUrl || `chrome-extension://${EXTENSION_ID}/popup.html`;
        const metamaskPage = yield browser.newPage();
        yield metamaskPage.goto(EXTENSION_URL);
    });
}
function confirmWelcomeScreen(metamaskPage) {
    return __awaiter(this, void 0, void 0, function* () {
        const continueButton = yield metamaskPage.waitForSelector(".welcome-page button");
        yield continueButton.click();
    });
}
function importAccount(metamaskPage, seed, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const importLink = yield metamaskPage.waitForSelector(".first-time-flow button");
        yield importLink.click();
        const metricsOptOut = yield metamaskPage.waitForSelector(".metametrics-opt-in button.btn-primary");
        yield metricsOptOut.click();
        const seedPhraseInput = yield metamaskPage.waitForSelector(".first-time-flow__seedphrase input");
        yield seedPhraseInput.type(seed);
        const passwordInput = yield metamaskPage.waitForSelector("#password");
        yield passwordInput.type(password);
        const passwordConfirmInput = yield metamaskPage.waitForSelector("#confirm-password");
        yield passwordConfirmInput.type(password);
        const acceptTerms = yield metamaskPage.waitForSelector(".first-time-flow__terms");
        yield acceptTerms.click();
        const restoreButton = yield metamaskPage.waitForSelector(".first-time-flow__button");
        yield restoreButton.click();
        const doneButton = yield metamaskPage.waitForSelector(".end-of-flow button");
        yield doneButton.click();
        const closeSwappingButton = yield metamaskPage.waitForSelector(".popover-header__button");
        yield closeSwappingButton.click();
        // Ensure popover is closed before continue
        yield metamaskPage.waitForFunction(() => {
            return document.querySelector(".popover-header__button") == null;
        });
    });
}
function waitForUnlockedScreen(metamaskPage) {
    return __awaiter(this, void 0, void 0, function* () {
        yield metamaskPage.waitForSelector(".main-container-wrapper");
    });
}
function waitForSignInScreen(metamaskPage) {
    return __awaiter(this, void 0, void 0, function* () {
        yield metamaskPage.waitForSelector(".unlock-page");
    });
}
function waitForEthereum(metamaskPage) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Promise.race([
            waitUntilStartConnectingToEthereum(metamaskPage),
            timeout(1),
        ]);
        return Promise.race([
            waitUntilConnectedToEthereum(metamaskPage),
            timeout(10),
        ]);
    });
}
function waitUntilStartConnectingToEthereum(metamaskPage) {
    return __awaiter(this, void 0, void 0, function* () {
        yield metamaskPage.waitForFunction(() => {
            return !!document.querySelector('img[src="images/loading.svg"]');
        });
    });
}
function waitUntilConnectedToEthereum(metamaskPage) {
    return __awaiter(this, void 0, void 0, function* () {
        yield metamaskPage.waitForFunction(() => {
            return document.querySelector('img[src="images/loading.svg"]') == null;
        });
    });
}
