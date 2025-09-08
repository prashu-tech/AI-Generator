import { Suspense } from "react";
import GoogleCallbackPage from "./GoogleCallbackClient";

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <GoogleCallbackPage />
    </Suspense>
  );
}
