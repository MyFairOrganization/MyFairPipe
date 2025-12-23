### Login with saving the cookie
```bash
  curl -i -X POST http://api.localhost/auth/login -H "Content-Type: application/json" -d '{"user_email":"test@example.com","password":"securepassword123"}' -c cookie.txt
```
### Upload a video using the cookie
```bash
  curl -X POST http://api.localhost/video/upload \
    -b cookies.txt \
    -F "title=Testvideo" \
    -F "description=Testing" \
    -F "age_restricted=false" \
    -F "file=@/home/alex/test.mp4"
```