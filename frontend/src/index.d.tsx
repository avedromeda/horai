export {}

declare global {
    interface String {
        formatUnicorn(...params: any[]): string
    }
}