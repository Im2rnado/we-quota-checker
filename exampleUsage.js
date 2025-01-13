const WeQuotaChecker = require("./index");

async function checkMyQuota() {
    try {
        const checker = new WeQuotaChecker("0228168538", "your_password");
        const quotaInfo = await checker.checkQuota();

        console.log(`
            Customer: ${quotaInfo.name}
            Plan: ${quotaInfo.offerName}
            Remaining: ${quotaInfo.remaining} / ${quotaInfo.total} (${quotaInfo.usagePercentage}% Used)
            Renewed On: ${quotaInfo.renewalDate}
            Expires On: ${quotaInfo.expiryDate} (${quotaInfo.expiryIn})
        `);
    } catch (error) {
        console.error("Error:", error.message);
    }
}

checkMyQuota();