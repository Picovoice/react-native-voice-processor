describe('VoiceProcessor', () => {
    beforeEach(async () => {
        await device.launchApp({newInstance: true});
    });

    it('should pass all tests', async () => {
        await element(by.id('runTests')).tap();
        await waitFor(element(by.id('testStatus')))
            .not.toExist()
            .withTimeout(12 * 60 * 1000);
        for (let i = 0; i < 3; i += 1) {
            await waitFor(element(by.id('testResult')).atIndex(i))
                .toExist()
                .withTimeout(1 * 60 * 1000);
            await expect(element(by.id('testResult')).atIndex(i)).toHaveText(
                'true',
            );
        }
    });
});
