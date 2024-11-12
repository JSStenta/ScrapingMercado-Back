// errorHandler.ts
/*
export async function errorHandler(ctx: any, next: () => Promise<void>) {
    try {
        await next();
    } catch (error) {
        console.error("Error en el servidor:", error);
        if (error instanceof Error) {
            ctx.response.status = (error as any).status || 500;
            ctx.response.body = {
                error: true,
                message: error.message || "Ocurrió un error inesperado.",
            };
        } else {
            ctx.response.status = 500;
            ctx.response.body = {
                error: true,
                message: "Ocurrió un error inesperado.",
            };
        }
    }
}
*/

export class UnknownError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "UnknownError";
    }
}

export class SupermarketError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "SupermarketError";
    }
}

export class ScraperError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ScraperError";
    }
}