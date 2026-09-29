import { expect, test } from "@playwright/test"

test("renders the Superyacht vessel and places cross-level capabilities", async ({
  page,
}) => {
  const consoleErrors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text())
    }
  })

  await page.goto("/", { waitUntil: "domcontentloaded" })
  await expect(
    page.getByRole("heading", { name: "Hatteras 63 Motor Yacht" }),
  ).toBeVisible()

  await page.getByRole("combobox", { name: "Hull" }).selectOption({
    label: "Tri-Deck Superyacht",
  })
  await expect(
    page.getByRole("heading", { name: "Tri-Deck Superyacht" }),
  ).toBeVisible()

  const canvas = page.locator("canvas")
  await expect(canvas).toBeVisible()
  await expect(page.locator("[data-artifact-ready='true']")).toBeVisible()
  const screenshot = await canvas.screenshot()
  const hasModelPixel = await page.evaluate(async (bytes) => {
    const image = new Image()
    image.src = `data:image/png;base64,${bytes}`
    await image.decode()
    const canvas = document.createElement("canvas")
    canvas.width = image.width
    canvas.height = image.height
    const context = canvas.getContext("2d")
    if (!context) {
      return false
    }
    context.drawImage(image, 0, 0)
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
    for (let index = 0; index < pixels.length; index += 4) {
      const [red, green, blue] = pixels.subarray(index, index + 3)
      if (
        Math.abs(red - 223) > 8 ||
        Math.abs(green - 231) > 8 ||
        Math.abs(blue - 229) > 8
      ) {
        return true
      }
    }
    return false
  }, screenshot.toString("base64"))
  expect(hasModelPixel).toBe(true)

  await expect(
    page.getByRole("button", { name: "Level: Main Deck" }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Level: Upper Deck" }).click()
  await expect(page.getByText("LEVEL", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Area: Upper Aft Deck" }).click()
  await expect(page.getByText("AREA", { exact: true })).toBeVisible()
  await expect(
    page.locator(".details").getByText("Upper Deck", { exact: true }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Speaker" }).click()
  await page.getByRole("button", { name: "Add capability" }).click()
  await expect(page.getByText("Speaker · Upper Aft Deck")).toBeVisible()

  await page.getByRole("button", { name: "Level: Sun Deck" }).click()
  await expect(page.getByText("LEVEL", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Area: Sun Deck" }).click()
  await page.getByRole("button", { name: "Thermal Camera" }).click()
  await page.getByRole("button", { name: "Add capability" }).click()
  await expect(page.getByText("Thermal Camera · Sun Deck")).toBeVisible()

  await page.getByRole("button", { name: "Area: Engine Room" }).click()
  await page.getByRole("button", { name: "Water Sensor" }).click()
  await page.getByRole("button", { name: "Add capability" }).click()
  await expect(page.getByText("Water Sensor · Engine Room")).toBeVisible()
  expect(consoleErrors).toEqual([])
})
