"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = 9300;
const validateGSTIN = (req, res, next) => {
    const { gstin } = req.body;
    if (!gstin || !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin)) {
        res.status(400).json({
            success: false,
            error: "Invalid GSTIN format. Please provide a valid 15-digit GSTIN."
        });
        return;
    }
    next(); // Proceed to the next middleware/route handler
};
app.use(express_1.default.json());
app.post('/gstin', validateGSTIN, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    try {
        const { gstin } = req.body;
        const response = yield fetch(`https://razorpay.com/api/gstin/${gstin}`, {
            method: 'GET',
            headers: { 'accept': 'application/json, text/plain, */*' },
        });
        const data = yield response.json();
        if (response.status === 200) {
            const details = (_b = (_a = data === null || data === void 0 ? void 0 : data.enrichment_details) === null || _a === void 0 ? void 0 : _a.online_provider) === null || _b === void 0 ? void 0 : _b.details;
            if (details) {
                const flattenedData = {
                    constitution: ((_c = details.constitution) === null || _c === void 0 ? void 0 : _c.value) || "",
                    gstin: ((_d = details.gstin) === null || _d === void 0 ? void 0 : _d.value) || "",
                    legalName: ((_e = details.legal_name) === null || _e === void 0 ? void 0 : _e.value) || "",
                    registrationDate: ((_f = details.registration_date) === null || _f === void 0 ? void 0 : _f.value) || "",
                    stateJurisdiction: ((_g = details.state_jurisdiction) === null || _g === void 0 ? void 0 : _g.value) || "",
                    status: ((_h = details.status) === null || _h === void 0 ? void 0 : _h.value) || "",
                    taxPayerType: ((_j = details.tax_payer_type) === null || _j === void 0 ? void 0 : _j.value) || "",
                };
                res.json({ success: true, data: flattenedData, error: null });
            }
            else {
                res.status(500).json({ success: false, data: null, error: "Unexpected response format" });
            }
        }
        else {
            res.status(response.status).json({ success: false, data: null, error: data.error_description || "Error fetching GSTIN details" });
        }
    }
    catch (error) {
        console.error("Fetch error:", error);
        res.status(500).json({ success: false, data: null, error: "Internal server error" });
    }
}));
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/ and https://gst.blitzdnd.com/`);
});
