# we-quota-checker

An NPM package that fetches your current quota details for WE (Telecom Egypt) ISP subscribers using their updated API. This package allows you to easily integrate WE quota checking into your Node.js applications without manual login requirements. It's perfect for monitoring usage patterns, creating automated checks, building dashboard applications, or any other scenario where you need programmatic access to your WE quota information

## Features & Retrieved Information

- Landline Owner Name
- Offer/Package Name
- Total Quota (GB)
- Used Quota (GB)
- Remaining Quota (GB)
- Usage Percentage
- Last Renewal Date and Time
- Next Renewal Date and Time
- Time Until Expiration (in days or hours)

## Installation

```bash
npm install we-quota-checker
```

## Usage

### Basic Usage

```javascript
const WeQuotaChecker = require("we-quota-checker");

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
```

### Response Object Structure

```javascript
{
    name: "John Doe",                    // Customer name
    offerName: "Super Mega Plus",        // Package name
    remaining: 235.5,                    // Remaining GB
    total: 500,                          // Total package GB
    usagePercentage: "52.90",           // Usage percentage
    renewalDate: "12/01/2024 at 12:00 AM", // Last renewal date
    expiryDate: "11/02/2024 at 11:59 PM",  // Expiry date
    expiryIn: "in 29 days"              // Time until expiry
}
```

## Configuration

The package requires two parameters for initialization:

1. **Landline Number** (`string`): 
   - Must start with "02"
   - Must be 10 digits long
   - Example: "0228168538"

2. **Password** (`string`):
   - Your WE account password
   - Can be reset at my.te.eg if forgotten

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.