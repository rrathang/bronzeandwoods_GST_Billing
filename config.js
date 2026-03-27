const config = {
    businessName: "Bronze and Woods",
    addressLine1: "1SUNAMBU CALAVAI, ALAPAKKAM MAIN ROAD, KARAMBAKKAM",
    addressLine2: "Chennai, TamilNadu - 600116",
    phone: "+91 9176386992",
    email: "bronzeandwoods@gmail.com",
    gstNumber: "33AAXFB4067D1ZE",
    // Default Tax Percentages
    taxRates: {
        cgst: 9, // %
        sgst: 9, // %
        igst: 0  // %
    },
    bankDetails: {
        accountName: "BRONZE AND WOODS",
        accountNumber: "1430102000006484",
        ifscCode: "IBKL0001430",
        bankName: "IDBI Bank"
    }
};

// Make config available globally
window.appConfig = config;
