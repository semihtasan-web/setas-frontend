import { expect, test, type Page } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@example.com";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "Admin123!";
const DEMO_EMAIL = process.env.E2E_DEMO_EMAIL ?? "demo@example.com";
const DEMO_PASSWORD = process.env.E2E_DEMO_PASSWORD ?? "Demo123!";
const RESTRICTED_EMAIL = process.env.E2E_RESTRICTED_EMAIL ?? "restricted@example.com";
const RESTRICTED_PASSWORD = process.env.E2E_RESTRICTED_PASSWORD ?? "Restricted123!";

async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("E-posta").fill(email);
  await page.getByLabel("Şifre").fill(password);
  await page.getByRole("button", { name: "Giriş Yap" }).click();
}

test("admin hesabı admin sayfasına gider", async ({ page }) => {
  await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  await expect(page).toHaveURL(/\/admin$|\/$/);
  await page.goto("/admin");
  await expect(page.getByText("Kullanıcılar")).toBeVisible();
  await expect(page.getByText("Erişim engellendi")).toHaveCount(0);
});

test("demo hesabı sadece demo akışına erişir", async ({ page }) => {
  await loginAs(page, DEMO_EMAIL, DEMO_PASSWORD);
  await expect(page).toHaveURL(/\/demo$|\/$/);
  await page.goto("/demo");
  await expect(page.getByText("Demir Teslimatı")).toBeVisible();
  await page.goto("/admin");
  await expect(page.getByText("Erişim engellendi")).toBeVisible();
});

test("restricted hesabı proje misafir ekranına gider", async ({ page }) => {
  await loginAs(page, RESTRICTED_EMAIL, RESTRICTED_PASSWORD);
  await expect(page).toHaveURL(/\/project-guest$|\/$/);
  await page.goto("/project-guest");
  await expect(page.getByText("Şantiye Bazlı Gerçek Veriler")).toBeVisible();
});
