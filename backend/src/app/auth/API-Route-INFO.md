In jeder API-Route:

```js
const userResult = await getUser(req);

if (userResult instanceof NextError || userResult instanceof NextResponse) {
    return userResult;
}

const user: User = userResult;
```