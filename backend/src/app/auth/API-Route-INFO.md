In jeder API-Route:

```js
const authHeader = req.headers.get("authorization");
const token = authHeader?.split(" ")[1];

const user = verifyToken(token);

if (!user) {
return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```