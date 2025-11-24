import {NextResponse} from "next/server";

export enum HttpError {
	BadRequest = "Bad Request",
	Unauthorized = "Unauthorized",
	PaymentRequired = "Payment Required",
	Forbidden = "Forbidden",
	NotFound = "Not Found",
	MethodNotAllowed = "Method Not Allowed",
	NotAcceptable = "Not Acceptable",
	ProxyAuthenticationRequired = "Proxy Authentication Required",
	RequestTimeout = "Request Timeout",
	Conflict = "Conflict",
	Gone = "Gone",
	LengthRequired = "Length Required",
	PreconditionFailed = "Precondition Failed",
	PayloadTooLarge = "Payload Too Large",
	URITooLong = "URI Too Long",
	UnsupportedMediaType = "Unsupported Media Type",
	RangeNotSatisfiable = "Range Not Satisfiable",
	ExpectationFailed = "Expectation Failed",
	ImATeapot = "I'm a teapot",
	UnprocessableEntity = "Unprocessable Entity",
	TooEarly = "Too Early",
	UpgradeRequired = "Upgrade Required",
	PreconditionRequired = "Precondition Required",
	TooManyRequests = "Too Many Requests",
	RequestHeaderFieldsTooLarge = "Request Header Fields Too Large",
	UnavailableForLegalReasons = "Unavailable For Legal Reasons",
	InternalServerError = "Internal Server Error",
	NotImplemented = "Not Implemented",
	BadGateway = "Bad Gateway",
	ServiceUnavailable = "Service Unavailable",
	GatewayTimeout = "Gateway Timeout",
	HTTPVersionNotSupported = "HTTP Version Not Supported",
}

export default class NextError {
	static STATUS_CODE_MAP: Record<HttpError, number> = {
		[HttpError.BadRequest]: 400,
		[HttpError.Unauthorized]: 401,
		[HttpError.PaymentRequired]: 402,
		[HttpError.Forbidden]: 403,
		[HttpError.NotFound]: 404,
		[HttpError.MethodNotAllowed]: 405,
		[HttpError.NotAcceptable]: 406,
		[HttpError.ProxyAuthenticationRequired]: 407,
		[HttpError.RequestTimeout]: 408,
		[HttpError.Conflict]: 409,
		[HttpError.Gone]: 410,
		[HttpError.LengthRequired]: 411,
		[HttpError.PreconditionFailed]: 412,
		[HttpError.PayloadTooLarge]: 413,
		[HttpError.URITooLong]: 414,
		[HttpError.UnsupportedMediaType]: 415,
		[HttpError.RangeNotSatisfiable]: 416,
		[HttpError.ExpectationFailed]: 417,
		[HttpError.ImATeapot]: 418,
		[HttpError.UnprocessableEntity]: 422,
		[HttpError.TooEarly]: 425,
		[HttpError.UpgradeRequired]: 426,
		[HttpError.PreconditionRequired]: 428,
		[HttpError.TooManyRequests]: 429,
		[HttpError.RequestHeaderFieldsTooLarge]: 431,
		[HttpError.UnavailableForLegalReasons]: 451,
		[HttpError.InternalServerError]: 500,
		[HttpError.NotImplemented]: 501,
		[HttpError.BadGateway]: 502,
		[HttpError.ServiceUnavailable]: 503,
		[HttpError.GatewayTimeout]: 504,
		[HttpError.HTTPVersionNotSupported]: 505,
	};

	public static error(
		message: string,
		error: HttpError | number = HttpError.InternalServerError
	) {
		let status: number;
		let errorName: string;
		if (typeof error === 'number') {
			status = error;

			let error_int = Object.keys(NextError.STATUS_CODE_MAP).find(key => NextError.STATUS_CODE_MAP[key as HttpError] === status);
			if (error_int) {
				errorName = error_int;
			} else {
				errorName = error.toString();
			}

		} else {
			status = NextError.STATUS_CODE_MAP[error];
			errorName = error;
		}

		return NextResponse.json(
			{error: errorName, message, status},
			{status}
		);
	}
}


