import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { getBlacklistedUsersService } from "../../../services/users/blacklist/get-blacklist.ts"
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type GetBlacklistServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type GetBlacklistServiceSuccess = ServiceSuccessSubset<'OK'>;

//GET api/users/blacklist
//Gets all blacklisted users
export const getBlacklistedUsers = async (req: Request, res: Response):
    Promise<GetBlacklistServiceSuccess | GetBlacklistServiceError> => {

    console.log("main function called");
    const result = await getBlacklistedUsersService();

    if (result === 'INTERNAL_ERROR') {
        const resBody: ApiResponse = {
            status: 500,
            error: 'Internal Server Error',
            data: null,
        };

        res.status(500).json(resBody);
        return "INTERNAL_ERROR";
    }

    if (result === null) {
        const resBody: ApiResponse = {
            status: 404,
            error: 'Not found',
            data: null,
        };

        res.status(404).json(resBody);
        return "NOT_FOUND";
    }

    const resBody: ApiResponse<typeof result> = {
        status: 200,
        error: null,
        data: result,
    };

    res.status(200).json(resBody);
    return "OK";
}