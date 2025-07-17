export class LizmapConnectionPage {

    /**
     * Constructor for initializing the login page elements.
     * @param {import('@playwright/test').Page} page - The page object representing the current browser context.
     */
    constructor(page) {
        this.page = page;
        this.loginField = page.locator('#jforms_jcommunity_login_auth_login');
        this.passwordField = page.locator('#jforms_jcommunity_login_auth_password');
        this.rememberMeCheckBox = page.locator('jforms_jcommunity_login_auth_remember_me');
        this.connectButton = page.getByRole('button', { name: 'Sign in' });
    }

    /**
     * Navigates to the connection page.
     */
    async goto() {
        await this.page.goto('admin.php/auth/login?auth_url_return=%2Findex.php');
    }

    /**
     * Authenticates a user by filling in the login credentials
     * @param {string} login - The login identifier to be used for authentication.
     * @param {string} password - The password associated with the login for authentication.
     */
    async connect(login, password) {
        await this.loginField.fill(login);
        await this.passwordField.fill(password);

        await this.connectButton.click();
        // Wait until the page receives the cookies.
        // Sometimes login flow sets cookies in the process of several redirects.
        // Wait for the final URL to ensure that the cookies are actually set.
        await this.page.waitForURL('index.php');
    }
}
