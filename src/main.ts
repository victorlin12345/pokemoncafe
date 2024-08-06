import {
  Builder,
  Browser,
  By,
  until,
  WebElement,
  WebDriver,
} from "selenium-webdriver";

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
let TARGET_CELL_INDEX = 5;

async function run() {
  const driver = await new Builder().forBrowser(Browser.CHROME).build();
  try {
    await driver.get("https://reserve.pokemon-cafe.jp/reserve/step1"); // tokyo

    ///////////////////////////////////////////////////
    ///////////////// CALENDAR PAGE ///////////////////
    ///////////////////////////////////////////////////

    // wait for calendar page to load
    let calendarLoadSuccess = false;
    while (!calendarLoadSuccess) {
      try {
        await driver.wait(
          until.elementLocated(By.xpath("//select[@name='guest']")),
          1000
        );
        calendarLoadSuccess = true;
      } catch {
        console.log("refreshing calendar page (load) ...");
        await driver
          .wait(
            until.elementLocated(By.xpath(`//*[contains(text(), "loading")]`)),
            1000
          )
          .click();
      }
    }

    // click guest select
    let calendarGuest = false;
    while (!calendarGuest) {
      try {
        await driver.findElement(By.xpath("//select[@name='guest']")).click();
        console.log("1. click guest select");
        calendarGuest = true;
      } catch {
        console.log("refreshing calendar page (guest) ...");
        await driver
          .wait(
            until.elementLocated(By.xpath(`//*[contains(text(), "loading")]`)),
            1000
          )
          .click();
      }
    }

    // select number of people
    let calendarNumber = false;
    while (!calendarNumber) {
      try {
        await driver
          .findElement(By.xpath(`//option[@value=${NUM_PEOPLE}]`))
          .click();
        console.log("2. select number of people:", NUM_PEOPLE);
        calendarNumber = true;
      } catch {
        console.log("refreshing calendar page (people number)...");
        await driver
          .wait(
            until.elementLocated(By.xpath(`//*[contains(text(), "loading")]`)),
            1000
          )
          .click();
      }
    }

    // click next month
    let calendarNext = false;
    while (!calendarNext) {
      try {
        await driver
          .wait(
            until.elementLocated(
              By.xpath(`//*[contains(text(), "次の月を見る")]`)
            ),
            1000
          )
          .click();
        console.log(`3. click next month`);
        calendarNext = true;
      } catch {
        console.log("refreshing calendar page (next month)...");
        await driver
          .wait(
            until.elementLocated(By.xpath(`//*[contains(text(), "loading")]`)),
            1000
          )
          .click();
      }
    }

    // click available date
    let calendarDate = false;
    while (!calendarDate) {
      try {
        let candidateCells = [];
        let cells = await driver.findElements(
          By.className("calendar-day-cell")
        );
        if (TARGET_CELL_INDEX >= 0) {
          // know target index (more faster!)
          candidateCells.push(cells[TARGET_CELL_INDEX]);
        } else {
          // find first available date
          for (let i = 0; i < cells.length; i++) {
            let text = await cells[i].getText();
            if (!text.includes("Full") && !text.includes("N/A")) {
              console.log("available date:", text);
              candidateCells.push(cells[i]);
            }
          }
        }
        if (candidateCells.length > 0) {
          await candidateCells[0].click();
          let target = await candidateCells[0].getText();
          console.log(
            "4. click first candidate cell!",
            target.replace(/\r\n|\n/g, "")
          );
        }

        await driver.findElement(By.id("submit_button")).click();
        console.log("5. click submit!");
        calendarDate = true;
      } catch {
        console.log("refreshing calendar page (date)...");
        await driver
          .wait(
            until.elementLocated(By.xpath(`//*[contains(text(), "loading")]`)),
            1000
          )
          .click();
      }
    }

    ///////////////////////////////////////////////////
    ///////////////// TIME SELECT PAGE ////////////////
    ///////////////////////////////////////////////////
    let openTimes: WebElement[] = [];
    await driver.wait(until.elementLocated(By.className("time-cell")), 1000);

    // find available time, refresh every 1 sec
    let j = 0;
    const timeInterval = setInterval(async () => {
      console.log("checking for available times");
      await driver
        .findElements(By.xpath('//a[@class="level post-link"]'))
        .then(async (times) => {
          openTimes = times;
          console.log(times);
          if (openTimes.length !== 0) {
            clearInterval(timeInterval);
          } else {
            console.log("no availability found! Refreshing");
            driver.navigate().refresh();
          }
          console.log(openTimes.length);
        });
    }, 1000);

    // priority for seating A
    while (j < openTimes.length) {
      const text = await openTimes[j].getText();
      if (text.includes("A")) {
        // pikachu area, iggypuff area
        openTimes.push(openTimes[j]);
      } else if (text.includes("C")) {
        // eevee area
        openTimes.push(openTimes[j]);
      } else if (text.includes("D")) {
        // lapras area
        openTimes.push(openTimes[j]);
      } else if (text.includes("B")) {
        // snorlax area
        openTimes.push(openTimes[j]);
      }
      console.log(text);
      j++;
    }

    let picked = 0;
    for (let i = 0; i < openTimes.length; i++) {
      try {
        await openTimes[i].click();
        picked = i;
        break;
      } catch {
        console.log("try next open time...");
      }
    }
    console.log("6. click open time:", openTimes[picked].getText());

    ///////////////////////////////////////////////////
    ///////////////// INPUT PAGE //////////////////////
    ///////////////////////////////////////////////////
    await driver
      .wait(until.elementLocated(By.id("name")), 1000)
      .then(async () => {
        await driver.findElement(By.id("name")).sendKeys(NAME);
        await driver.findElement(By.id("name_kana")).sendKeys(NAME);
        await driver.findElement(By.id("phone_number")).sendKeys(PHONE);
        await driver.findElement(By.id("email")).sendKeys(EMAIL);
        await driver.findElement(By.xpath("//input[@name='commit']")).click();
      });

    /////////////////////////////////////////////////
    ///////////////// CONFIRM PAGE //////////////////
    /////////////////////////////////////////////////

    // receive authentication code from your email
    console.log("receive authentication code from your email!!");
    console.log("then manully click next step! is on yourself now");
    console.log(
      "if you want to buy exclusive items, dont forget pick now which only allow online"
    );
  } catch (error) {
    console.log("Error:", error);
  } finally {
    // await driver.quit();
  }
}

run();
