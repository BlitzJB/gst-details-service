import express, { Request, Response } from 'express';

const app = express();
const port = 9300;

interface GSTINRequest {
    gstin: string;
}

interface FlattenedCompanyData {
    constitution: string;
    gstin: string;
    legalName: string;
    registrationDate: string;
    stateJurisdiction: string;
    status: string;
    taxPayerType: string;
}

interface ApiResponse {
    success: boolean;
    data: FlattenedCompanyData | null;
    error: string | null;
}

const validateGSTIN = (req: Request, res: Response, next: Function) => {
    const { gstin }: GSTINRequest = req.body;

    if (!gstin || !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin)) {
        res.status(400).json({
            success: false,
            error: "Invalid GSTIN format. Please provide a valid 15-digit GSTIN."
        });
        return;
    }
    next(); // Proceed to the next middleware/route handler
};

app.use(express.json());

app.post('/gstin', validateGSTIN, async (req: Request, res: Response) => {
    try {
        const { gstin } = req.body;

        const response = await fetch(`https://razorpay.com/api/gstin/${gstin}`, {
            method: 'GET',
            headers: { 'accept': 'application/json, text/plain, */*' },
        });

        const data = await response.json();

        if (response.status === 200) {
            const details = data?.enrichment_details?.online_provider?.details;

            if (details) {
                const flattenedData: FlattenedCompanyData = {
                    constitution: details.constitution?.value || "",
                    gstin: details.gstin?.value || "",
                    legalName: details.legal_name?.value || "",
                    registrationDate: details.registration_date?.value || "",
                    stateJurisdiction: details.state_jurisdiction?.value || "",
                    status: details.status?.value || "",
                    taxPayerType: details.tax_payer_type?.value || "",
                };
                res.json({ success: true, data: flattenedData, error: null });
            } else {
                res.status(500).json({ success: false, data: null, error: "Unexpected response format" });
            }
        } else {
            res.status(response.status).json({ success: false, data: null, error: data.error_description || "Error fetching GSTIN details" });
        }
    } catch (error) {
        console.error("Fetch error:", error);
        res.status(500).json({ success: false, data: null, error: "Internal server error" });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/ and https://gst.blitzdnd.com/`);
});
