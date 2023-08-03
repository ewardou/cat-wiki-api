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
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv_1 = require("dotenv");
const cors_1 = __importDefault(require("cors"));
(0, dotenv_1.config)();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.get('/breeds', (_req, res, next) => {
    (0, node_fetch_1.default)('https://api.thecatapi.com/v1/breeds')
        .then((apiResponse) => apiResponse.json())
        .then((json) => __awaiter(void 0, void 0, void 0, function* () {
        yield Promise.all(json.map((el) => __awaiter(void 0, void 0, void 0, function* () {
            return yield (0, node_fetch_1.default)(`https://api.thecatapi.com/v1/images/${el.reference_image_id !== undefined ? el.reference_image_id : '056YfVlDT'}`)
                .then((imageApiResp) => __awaiter(void 0, void 0, void 0, function* () { return yield imageApiResp.json(); }))
                .then(imageApiJson => { el.url = imageApiJson.url; return el; });
        })));
        const filtered = json.map((el) => { return { id: el.id, name: el.name, url: el.url }; });
        res.json(filtered);
    }))
        .catch((e) => next(e));
});
app.get('/breeds/:breedID', (req, res, next) => {
    (0, node_fetch_1.default)(`https://api.thecatapi.com/v1/breeds/${req.params.breedID}`)
        .then((resp) => __awaiter(void 0, void 0, void 0, function* () { return yield resp.json(); }))
        .then((json) => __awaiter(void 0, void 0, void 0, function* () {
        const [referenceImg, galleryImg] = yield Promise.all([
            (0, node_fetch_1.default)(`https://api.thecatapi.com/v1/images/${json.reference_image_id !== undefined ? json.reference_image_id : '056YfVlDT'}`).then((resp) => __awaiter(void 0, void 0, void 0, function* () { return yield resp.json(); })),
            (0, node_fetch_1.default)(`https://api.thecatapi.com/v1/images/search?limit=8&breed_ids=${req.params.breedID}&api_key=${process.env.API_KEY}`).then((resp) => __awaiter(void 0, void 0, void 0, function* () { return yield resp.json(); }))
        ]);
        json.url = referenceImg.url;
        json.gallery = galleryImg.map((el) => el.url);
        res.json(json);
    }))
        .catch(e => next(e));
});
app.listen(3000, () => {
    console.log('Server started');
});
