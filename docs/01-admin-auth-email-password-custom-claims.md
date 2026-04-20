> TRẠNG THÁI HIỆN TẠI: TÀI LIỆU THAM KHẢO LỊCH SỬ, KHÔNG THỰC THI CHO HƯỚNG SUPABASE.
>
> Dự án hiện đã chốt hướng chính là Supabase Auth + Postgres + Storage. Nếu muốn triển khai tiếp, dùng `docs/00-ke-hoach-thuc-thi-thong-nhat.md`. Tài liệu này chỉ giữ lại để tham khảo phương án Firebase Email/Password + Custom Claims trong trường hợp buộc phải rollback về Firebase.
# Tài liệu tham khảo lịch sử: Firebase Admin Email/Password + Custom Claims

## Trạng thái

Tài liệu này chỉ là phương án chuyển tiếp nếu dự án buộc phải tiếp tục giữ Firebase Auth/Firestore.

Nếu đã quyết định bỏ Firebase/Firestore và chuyển sang Supabase Postgres/Auth/Storage, không thực thi tài liệu này như phase chính. Khi đó, chỉ dùng `docs/00-ke-hoach-thuc-thi-thong-nhat.md`.

## 1. Muc tieu

Thay co che dang nhap Admin bang Google hien tai bang co che rieng cho CMS:

- Admin dang nhap bang email va mat khau.
- Khong co trang dang ky cong khai.
- Quyen Admin duoc gan bang Firebase Custom Claims.
- Firestore Rules chi cho phep ghi du lieu khi token co `admin: true`.
- Khong hardcode email admin trong source code hoac `firestore.rules`.

Trang public van doc du lieu cong khai. Khu vuc `/admin` moi yeu cau dang nhap va quyen admin.

## 2. Kien truc de xuat

Luong dang nhap:

```text
Admin nhap email + password
Firebase Auth xac thuc tai khoan
Client doc ID token claims
Neu token co admin: true -> cho vao CMS
Neu khong co admin: true -> chan giao dien Admin
Firestore Rules tiep tuc chan moi request ghi neu token khong co admin: true
```

Nguon su that ve quyen:

```text
Firebase Custom Claims
```

Khong nen dung:

```text
React env ADMIN_PASSWORD
Firestore document chua password
Hardcode email trong firestore.rules
```

Ly do: frontend bundle co the bi xem, Firestore rules khong nen gan chat voi mot email, va password tu quan ly se keo theo rat nhieu rui ro ve hashing, reset, lockout va session.

## 3. Hien trang can thay doi

File lien quan hien tai:

- `src/pages/Admin.tsx`: dang dung `signInWithPopup(auth, googleProvider)`.
- `src/firebase.ts`: dang export `googleProvider`.
- `firestore.rules`: dang hardcode email admin va kiem tra role trong `/users/{uid}`.
- `firebase-applet-config.json`: cau hinh Firebase client.

Muc tieu sau refactor:

- `Admin.tsx` dung `signInWithEmailAndPassword`.
- `firebase.ts` khong can `GoogleAuthProvider`.
- `firestore.rules` dung `request.auth.token.admin == true`.
- Them script noi bo de gan hoac go quyen admin cho tai khoan.

## 4. Cau hinh Firebase Console

1. Vao Firebase Console.
2. Chon project dang dung trong `firebase-applet-config.json`.
3. Vao `Authentication`.
4. Vao tab `Sign-in method`.
5. Enable `Email/Password`.
6. Tam thoi giu Google provider trong giai do migration neu dang can tai khoan cu.
7. Sau khi test Email/Password xong, disable Google provider.
8. Vao `Authentication > Settings > Password policy`.
9. Dat password policy toi thieu:

```text
Minimum length: 12
Require uppercase: yes
Require lowercase: yes
Require numeric: yes
Require symbol: yes
Mode: Require
```

10. Vao `Authentication > Settings > Authorized domains`.
11. Dam bao co domain production va domain local can test, vi du:

```text
localhost
127.0.0.1
ten-domain-production.com
```

Luu y: voi project tao moi sau 2025-04-28, Firebase khong tu them `localhost` vao authorized domains.

## 5. Tao tai khoan Admin

Cach khuyen nghi cho giai do dau:

1. Vao `Firebase Console > Authentication > Users`.
2. Tao user moi:

```text
Email: admin@your-domain.com
Password: mat khau manh
```

3. Khong tao form dang ky trong app.
4. Sau khi tao user, chay script gan custom claim.

## 6. Cai Firebase Admin SDK

Can them dependency dung cho script noi bo:

```powershell
npm install -D firebase-admin
```

Khong import `firebase-admin` vao code frontend.

## 7. Service account local

1. Vao Firebase Console.
2. `Project settings > Service accounts`.
3. Tao private key JSON.
4. Dat file ngoai source control, vi du:

```text
C:\Users\<user>\secrets\web-bac-si-service-account.json
```

5. Khong dat file nay trong repo. Repo da them ignore cho:

```text
serviceAccount*.json
firebase-adminsdk*.json
```

## 8. Script gan quyen Admin

Tao file:

```text
scripts/admin/set-admin-claim.ts
```

Noi dung de xuat:

```ts
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const email = process.argv[2];

if (!email) {
  console.error('Usage: npx tsx scripts/admin/set-admin-claim.ts admin@example.com');
  process.exit(1);
}

initializeApp({
  credential: applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID,
});

const auth = getAuth();
const user = await auth.getUserByEmail(email);
const currentClaims = user.customClaims ?? {};

await auth.setCustomUserClaims(user.uid, {
  ...currentClaims,
  admin: true,
  role: 'admin',
});

console.log(`Granted admin claim to ${email} (${user.uid})`);
```

Lenh chay tren PowerShell:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\<user>\secrets\web-bac-si-service-account.json"
$env:FIREBASE_PROJECT_ID="gen-lang-client-0976612764"
npx tsx scripts/admin/set-admin-claim.ts admin@your-domain.com
```

Sau khi gan claim, tai khoan can dang xuat va dang nhap lai de token moi co claim.

## 9. Script go quyen Admin

Tao file:

```text
scripts/admin/remove-admin-claim.ts
```

Noi dung de xuat:

```ts
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const email = process.argv[2];

if (!email) {
  console.error('Usage: npx tsx scripts/admin/remove-admin-claim.ts admin@example.com');
  process.exit(1);
}

initializeApp({
  credential: applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID,
});

const auth = getAuth();
const user = await auth.getUserByEmail(email);
const currentClaims = user.customClaims ?? {};

const { admin, role, ...remainingClaims } = currentClaims;

await auth.setCustomUserClaims(user.uid, remainingClaims);

console.log(`Removed admin claim from ${email} (${user.uid})`);
```

## 10. Sua `firestore.rules`

Doi ham `isAdmin()` thanh:

```js
function isAdmin() {
  return request.auth != null && request.auth.token.admin == true;
}
```

Khong nen giu hardcode:

```js
request.auth.token.email == "..."
```

Ly do:

- Doi email se khong phai sua rules.
- Them admin moi chi can set claim.
- Firestore Rules khong can doc `/users/{uid}` moi lan ghi, giam do phuc tap va chi phi read trong rules.

Sau khi sua rules:

```powershell
firebase deploy --only firestore:rules
```

Neu chua cai Firebase CLI:

```powershell
npm install -g firebase-tools
firebase login
firebase use <project-id>
```

## 11. Sua `src/firebase.ts`

Hien tai co:

```ts
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
export const googleProvider = new GoogleAuthProvider();
```

Sau refactor:

```ts
import { getAuth } from 'firebase/auth';

export const auth = getAuth(app);
```

Khong can export `googleProvider` nua.

## 12. Sua `src/pages/Admin.tsx`

Imports moi:

```ts
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
```

Bo:

```ts
signInWithPopup
```

Login state can co:

```ts
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [authError, setAuthError] = useState('');
```

Kiem tra admin bang token claims:

```ts
const token = await currentUser.getIdTokenResult(true);
setIsAdmin(token.claims.admin === true);
```

Ham login:

```ts
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  if (isLoggingIn) return;

  setIsLoggingIn(true);
  setAuthError('');

  try {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  } catch {
    setAuthError('Email hoac mat khau khong dung.');
  } finally {
    setIsLoggingIn(false);
  }
};
```

Ham reset password:

```ts
const handleResetPassword = async () => {
  if (!email.trim()) {
    setAuthError('Nhap email de gui link dat lai mat khau.');
    return;
  }

  await sendPasswordResetEmail(auth, email.trim());
  setAuthError('Neu email hop le, he thong da gui link dat lai mat khau.');
};
```

Thong bao loi login nen generic. Khong thong bao ro "email khong ton tai" hay "sai mat khau".

## 13. UI Admin Login de xuat

Login screen nen co:

- Email input.
- Password input.
- Nut dang nhap.
- Nut quen mat khau.
- Loading state.
- Generic error message.
- Khong co nut dang ky.

Thong diep nen ngan gon:

```text
Dang nhap quan tri
Email
Mat khau
Dang nhap
Quen mat khau?
```

## 14. Checklist kiem thu

Kiem thu local:

```powershell
npm run lint
npm run build
npm run dev
```

Kiem thu Docker:

```powershell
docker compose up -d --build
curl.exe -I http://localhost:3001
```

Case can test:

- Admin co claim `admin: true` dang nhap duoc.
- User khong co claim dang nhap nhung bi chan o `/admin`.
- User khong co claim khong ghi duoc Firestore.
- Public site van doc duoc `books`, `notes`, `products`, `settings`.
- Reset password gui email thanh cong.
- Sau khi remove claim, user dang xuat/dang nhap lai va khong vao duoc Admin.
- Sau khi disable Google provider, Google login khong con duoc goi trong code.

## 15. Rollback

Neu can quay lai tam thoi:

1. Enable lai Google provider trong Firebase Console.
2. Restore code `signInWithPopup`.
3. Restore `googleProvider`.
4. Restore rule hardcode email hoac role doc tu `/users/{uid}`.
5. Deploy lai rules.

Khong nen rollback lau dai vi rules hardcode email va Google provider khong dung voi mong muon van hanh cua du an.

## 16. Mo rong sau nay

Sau khi Email/Password + custom claims on dinh, nen lam tiep:

- Them `auditLogs` cho moi hanh dong create/update/delete.
- Them role `owner`, `editor`, `medical_reviewer`.
- Them workflow `draft`, `in_review`, `published`, `archived`.
- Them truong `reviewedBy`, `reviewedAt`, `nextReviewAt`, `sources` cho bai viet y khoa.
- Bat TOTP MFA neu nang cap Firebase Authentication with Identity Platform.
- Tach Gemini API ra backend de khong lo API key.

## 17. Tai lieu tham khao

- Firebase Email/Password Auth: https://firebase.google.com/docs/auth/web/password-auth
- Firebase Manage Users: https://firebase.google.com/docs/auth/web/manage-users
- Firebase Custom Claims: https://firebase.google.com/docs/auth/admin/custom-claims
- Firebase TOTP MFA: https://firebase.google.com/docs/auth/web/totp-mfa
- OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- NIST SP 800-63B: https://pages.nist.gov/800-63-4/sp800-63b.html

## 18. Lệnh giao việc cũ

Prompt thực thi Firebase cũ đã bị loại bỏ để tránh xung đột với hướng Supabase hiện tại.

Nếu cần giao AI agent thực thi nâng cấp, dùng prompt trong:

```text
docs/00-ke-hoach-thuc-thi-thong-nhat.md
```


