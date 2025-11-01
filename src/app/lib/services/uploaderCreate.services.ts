import { TusCreateHeaders } from "../dtos/tus.header.dto";
import { TusResponse } from "../dtos/tus.response.dto";


class UploaderCreateService {
    private static instance: UploaderCreateService;

    private constructor() {}
    public static getInstance(): UploaderCreateService {
        if (!UploaderCreateService.instance) {
            UploaderCreateService.instance = new UploaderCreateService();
        }
        return UploaderCreateService.instance;
    }

    public async createUploadPhotoUrl(headers:TusCreateHeaders, body: ArrayBuffer): Promise<TusResponse> {


    }
}

export { UploaderCreateService };