import { expect, test } from "@playwright/test"

test("renders and explores the validated equipment-model fixture", async ({
  page,
}) => {
  const consoleErrors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text())
    }
  })

  await page.goto("/")
  await expect(
    page.getByRole("heading", { name: "Detroit Diesel 8V92TA" }),
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

  await page.getByRole("button", { name: "Piston L1" }).click()
  await expect(page.getByText("piston.l1")).toBeVisible()
  await page.getByRole("button", { name: "Isolate" }).click()
  await page.getByRole("button", { name: "Reset" }).click()
  await expect(
    page.getByText("Select a semantic component in the canvas or list."),
  ).toBeVisible()
  expect(consoleErrors).toEqual([])
})
