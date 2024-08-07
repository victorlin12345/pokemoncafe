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
Object.defineProperty(exports, "__esModule", { value: true });
const selenium_webdriver_1 = require("selenium-webdriver");
// number of people (required)
const NUM_PEOPLE = 2;
// reserve name (required)
let NAME = "CHEN WEN LIN";
// reserve phone (required)
let PHONE = "0970982035";
// authentication email (required)
let EMAIL = "victorlin12345@gmail.com";
// target calendar cell index, if < 0 will get the first available day (optoinal)
// reference: https://reserve.pokemon-cafe.jp/reserve/step2
let TARGET_CELL_INDEX = 7;
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const driver = yield new selenium_webdriver_1.Builder().forBrowser(selenium_webdriver_1.Browser.CHROME).build();
        try {
            yield driver.get("https://reserve.pokemon-cafe.jp/reserve/step1"); // tokyo
            ///////////////////////////////////////////////////
            ///////////////// CALENDAR PAGE ///////////////////
            ///////////////////////////////////////////////////
            // wait for calendar page to load
            let calendarLoadSuccess = false;
            while (!calendarLoadSuccess) {
                try {
                    yield driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.xpath("//select[@name='guest']")), 10000);
                    calendarLoadSuccess = true;
                }
                catch (_a) {
                    console.log("refreshing calendar page (load) ...");
                    yield driver
                        .wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.xpath(`//*[contains(text(), "Reloading")]`)), 10000)
                        .click();
                }
            }
            // click guest select
            let calendarGuest = false;
            while (!calendarGuest) {
                try {
                    yield driver.findElement(selenium_webdriver_1.By.xpath("//select[@name='guest']")).click();
                    console.log("1. click guest select");
                    calendarGuest = true;
                }
                catch (_b) {
                    console.log("refreshing calendar page (guest) ...");
                    yield driver
                        .wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.xpath(`//*[contains(text(), "Reloading")]`)), 10000)
                        .click();
                }
            }
            // select number of people
            let calendarNumber = false;
            while (!calendarNumber) {
                try {
                    yield driver
                        .findElement(selenium_webdriver_1.By.xpath(`//option[@value=${NUM_PEOPLE}]`))
                        .click();
                    console.log("2. select number of people:", NUM_PEOPLE);
                    calendarNumber = true;
                }
                catch (_c) {
                    console.log("refreshing calendar page (people number)...");
                    yield driver
                        .wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.xpath(`//*[contains(text(), "Reloading")]`)), 10000)
                        .click();
                }
            }
            // click next month
            let calendarNext = false;
            while (!calendarNext) {
                try {
                    yield driver
                        .wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.xpath(`//*[contains(text(), "次の月を見る")]`)), 10000)
                        .click();
                    console.log(`3. click next month`);
                    calendarNext = true;
                }
                catch (_d) {
                    console.log("refreshing calendar page (next month)...");
                    yield driver
                        .wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.xpath(`//*[contains(text(), "Reloading")]`)), 10000)
                        .click();
                }
            }
            // click available date
            let calendarDate = false;
            while (!calendarDate) {
                try {
                    let candidateCells = [];
                    let cells = yield driver.findElements(selenium_webdriver_1.By.className("calendar-day-cell"));
                    if (TARGET_CELL_INDEX >= 0) {
                        // know target index (more faster!)
                        candidateCells.push(cells[TARGET_CELL_INDEX]);
                    }
                    else {
                        // find first available date
                        for (let i = 0; i < cells.length; i++) {
                            let text = yield cells[i].getText();
                            if (!text.includes("Full") && !text.includes("N/A")) {
                                console.log("available date:", text);
                                candidateCells.push(cells[i]);
                            }
                        }
                    }
                    if (candidateCells.length > 0) {
                        yield candidateCells[0].click();
                        let target = yield candidateCells[0].getText();
                        console.log("4. click first candidate cell!", target.replace(/\r\n|\n/g, ""));
                    }
                    yield driver.findElement(selenium_webdriver_1.By.id("submit_button")).click();
                    console.log("5. click submit!");
                    calendarDate = true;
                }
                catch (_e) {
                    console.log("refreshing calendar page (date)...");
                    yield driver
                        .wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.xpath(`//*[contains(text(), "Reloading")]`)), 10000)
                        .click();
                }
            }
            ///////////////////////////////////////////////////
            ///////////////// TIME SELECT PAGE ////////////////
            ///////////////////////////////////////////////////
            let openTimes = [];
            try {
                yield driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.className("time-cell")), 3000);
            }
            catch (_f) {
                console.log("refreshing calendar page (date)...");
                yield driver
                    .wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.xpath(`//*[contains(text(), "Reloading")]`)), 10000)
                    .click();
            }
            // find available time, refresh every 1 sec
            let j = 0;
            const timeInterval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                console.log("checking for available times");
                yield driver
                    .findElements(selenium_webdriver_1.By.xpath('//a[@class="level post-link"]'))
                    .then((times) => __awaiter(this, void 0, void 0, function* () {
                    openTimes = times;
                    console.log(times);
                    if (openTimes.length !== 0) {
                        clearInterval(timeInterval);
                    }
                    else {
                        console.log("no availability found! Refreshing");
                        driver.navigate().refresh();
                    }
                    console.log(openTimes.length);
                }));
            }), 1000);
            // // priority for seating A
            // while (j < openTimes.length) {
            //   const text = await openTimes[j].getText();
            //   if (text.includes("A")) {
            //     // pikachu area, iggypuff area
            //     openTimes.push(openTimes[j]);
            //   } else if (text.includes("C")) {
            //     // eevee area
            //     openTimes.push(openTimes[j]);
            //   } else if (text.includes("D")) {
            //     // lapras area
            //     openTimes.push(openTimes[j]);
            //   } else if (text.includes("B")) {
            //     // snorlax area
            //     openTimes.push(openTimes[j]);
            //   }
            //   console.log(text);
            //   j++;
            // }
            // let picked = 0;
            // for (let i = 0; i < openTimes.length; i++) {
            //   try {
            //     await openTimes[i].click();
            //     picked = i;
            //     break;
            //   } catch {
            //     console.log("try next open time...");
            //   }
            // }
            if (openTimes.length > 0) {
                try {
                    yield openTimes[0].click();
                }
                catch (_g) {
                    console.log("try next open time...");
                }
                console.log("6. click open time:", openTimes[0].getText());
            }
            ///////////////////////////////////////////////////
            ///////////////// INPUT PAGE //////////////////////
            ///////////////////////////////////////////////////
            yield driver
                .wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.id("name")), 1000)
                .then(() => __awaiter(this, void 0, void 0, function* () {
                yield driver.findElement(selenium_webdriver_1.By.id("name")).sendKeys(NAME);
                yield driver.findElement(selenium_webdriver_1.By.id("name_kana")).sendKeys(NAME);
                yield driver.findElement(selenium_webdriver_1.By.id("phone_number")).sendKeys(PHONE);
                yield driver.findElement(selenium_webdriver_1.By.id("email")).sendKeys(EMAIL);
                yield driver.findElement(selenium_webdriver_1.By.xpath("//input[@name='commit']")).click();
            }));
            /////////////////////////////////////////////////
            ///////////////// CONFIRM PAGE //////////////////
            /////////////////////////////////////////////////
            // receive authentication code from your email
            console.log("receive authentication code from your email!!");
            console.log("then manully click next step! is on yourself now");
            console.log("if you want to buy exclusive items, dont forget pick now which only allow online");
        }
        catch (error) {
            console.log("Error:", error);
        }
        finally {
            // await driver.quit();
        }
    });
}
run();
