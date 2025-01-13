const axios = require("axios");
const { DateTime } = require("luxon");

class WeQuotaChecker {
    constructor(landlineNumber, password) {
        if (!landlineNumber || !password) {
            throw new Error("Landline number and password are required");
        }

        if (!landlineNumber.startsWith("02") || landlineNumber.length !== 10) {
            throw new Error("Invalid landline number format. Must start with 02 and be 10 digits");
        }

        // Your credentials
        this.LND_NUMBER = landlineNumber;
        this.LND_PASS = password;
        this.ACCT_ID = "FBB" + this.LND_NUMBER.slice(1);

        this.session = axios.create({
            baseURL: "https://api-my.te.eg",
            headers: {
                "Accept": "application/json, text/plain, */*",
                "Accept-Language": "en-US,en;q=0.9,ar;q=0.8",
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "channelId": "702",
                "isCoporate": "false",
                "isMobile": "false",
                "isSelfcare": "true",
                "languageCode": "en-US"
            }
        });
    }

    tsConv(unixTimestamp, returnUntil = false) {
        const dtLocal = DateTime.fromMillis(unixTimestamp);
        const formattedDate = dtLocal.toFormat("dd/MM/yyyy 'at' hh:mm a");

        const dates = [formattedDate];

        if (returnUntil) {
            const now = DateTime.now();
            const diff = dtLocal.diff(now, ["days", "hours"]);

            if (diff.days < 1) {
                const hoursLeft = Math.floor(diff.hours);
                dates.push(`in ${hoursLeft} hours`);
            } else {
                dates.push(`in ${Math.floor(diff.days)} days`);
            }
        }

        return dates;
    }

    async authenticate() {
        await this.session.post("/echannel/service/besapp/base/rest/busiservice/v1/common/querySysParams", {});

        const authResponse = await this.session.post("/echannel/service/besapp/base/rest/busiservice/v1/auth/userAuthenticate", {
            acctId: this.ACCT_ID,
            appLocale: "en-US",
            password: this.LND_PASS
        });

        if (authResponse.data.header.retCode !== "0") {
            throw new Error("Authentication failed");
        }

        return authResponse.data.body;
    }

    async getSubscribedOfferings(token) {
        const offersResponse = await this.session.post(
            "/echannel/service/besapp/base/rest/busiservice/cz/v1/auth/getSubscribedOfferings",
            {
                msisdn: this.ACCT_ID,
                numberServiceType: "FBB",
                groupId: ""
            },
            {
                headers: { csrftoken: token }
            }
        );

        if (offersResponse.data.header.retCode !== "0") {
            throw new Error("Failed to get subscribed offerings");
        }

        return offersResponse.data.body.offeringList[0].mainOfferingId;
    }

    async getQuotaDetails(token, subscriberId, offerId) {
        const quotaResponse = await this.session.post(
            "/echannel/service/besapp/base/rest/busiservice/cz/cbs/bb/queryFreeUnit",
            {
                subscriberId: subscriberId,
                mainOfferId: offerId
            },
            {
                headers: { csrftoken: token }
            }
        );

        if (quotaResponse.data.header.retCode !== "0") {
            throw new Error("Failed to get quota details");
        }

        return quotaResponse.data.body[0];
    }

    async checkQuota() {
        try {
            const authData = await this.authenticate();
            const { customer, subscriber, token } = authData;

            const offerId = await this.getSubscribedOfferings(token);
            const quota = await this.getQuotaDetails(token, subscriber.subscriberId, offerId);

            const usagePrc = (quota.used / quota.total) * 100;
            const renewedDate = this.tsConv(quota.effectiveTime)[0];
            const expiryDate = this.tsConv(quota.expireTime, true);

            return {
                name: customer.custName,
                offerName: quota.offerName,
                remaining: quota.remain,
                total: quota.total,
                usagePercentage: usagePrc.toFixed(2),
                renewalDate: renewedDate,
                expiryDate: expiryDate[0],
                expiryIn: expiryDate[1]
            };
        } catch (error) {
            throw new Error(`Quota check failed: ${error.message}`);
        }
    }
}

module.exports = WeQuotaChecker;