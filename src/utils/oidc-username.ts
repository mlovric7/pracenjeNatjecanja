export function setUsername(req: Express.Request): string | undefined {
    let username : string | undefined;
    if (req.oidc.isAuthenticated()) {
        username = req.oidc.user?.name ?? req.oidc.user?.sub;
    }
    return username
}